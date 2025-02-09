import { PartialMessage } from '@bufbuild/protobuf'

import { maxCardValidity } from '../bp-modules/cards/AddCardForm'
import { CardExtensions, CardInfo, DynamicActivationCode, QrCode, StaticVerificationCode } from '../generated/card_pb'
import { Region } from '../generated/graphql'
import { CardConfig } from '../project-configs/getProjectConfig'
import PlainDate from '../util/PlainDate'
import { isContentLengthValid } from '../util/qrcode'
import RegionExtension from './extensions/RegionExtension'
import StartDayExtension from './extensions/StartDayExtension'
import { Extension, ExtensionInstance, JSONExtension, findExtension } from './extensions/extensions'
import { PEPPER_LENGTH } from './hashCardInfo'

// Due to limited space on the cards
const MAX_NAME_LENGTH = 30
// Due to limited space on the qr code
const MAX_ENCODED_NAME_LENGTH = 50
const ACTIVATION_SECRET_LENGTH = 20

export interface JSONCardBlueprint<E = ExtensionInstance> {
  id: number
  fullName: string
  expirationDate: string | null
  extensions: (E extends Extension<infer T, unknown> ? JSONExtension<T> : never)[]
}

/**
 * Blueprint for a new card. This object contains data about a future card, which will be created.
 */
export class CardBlueprint {
  id: number
  fullName: string
  expirationDate: PlainDate | null
  extensions: ExtensionInstance[]
  cardConfig: CardConfig

  constructor(fullName: string, cardConfig: CardConfig, initParams?: Parameters<CardBlueprint['initialize']>) {
    this.cardConfig = cardConfig
    this.fullName = fullName
    this.expirationDate =
      cardConfig.defaultValidity && initParams
        ? PlainDate.fromLocalDate(new Date()).add(cardConfig.defaultValidity)
        : null
    this.extensions = cardConfig.extensions.map(Extension => new Extension())
    this.id = Math.floor(Math.random() * 1000000) // Assign some random ID
    if (initParams) {
      this.initialize(...initParams)
    }
  }

  setValue(key: string, value: string): void {
    switch (key) {
      case this.cardConfig.nameColumnName:
        this.fullName = value
        break
      case this.cardConfig.expiryColumnName:
        this.setExpirationDate(value)
        break
      default:
        const extensionIdx = this.cardConfig.extensionColumnNames.indexOf(key)
        if (extensionIdx === -1) {
          return
        }
        this.extensions[extensionIdx].fromString(value)
    }
  }

  initialize(region: Region) {
    this.extensions.forEach(ext => {
      if (ext instanceof RegionExtension) ext.setInitialState(region)
      else ext.setInitialState()
    })
  }

  hasInfiniteLifetime(): boolean {
    return this.extensions.some(ext => ext.causesInfiniteLifetime())
  }

  isFullNameValid(): boolean {
    const encodedName = new TextEncoder().encode(this.fullName)
    return (
      this.fullName.length > 0 &&
      encodedName.length <= MAX_ENCODED_NAME_LENGTH &&
      this.fullName.length <= MAX_NAME_LENGTH
    )
  }

  isStartDayBeforeExpirationDay = (expirationDate: PlainDate): boolean => {
    const startDayExtension = findExtension(this.extensions, StartDayExtension)
    return startDayExtension?.state?.startDay
      ? PlainDate.fromDaysSinceEpoch(startDayExtension.state.startDay).isBefore(expirationDate)
      : true
  }

  isExpirationDateValid(): boolean {
    const today = PlainDate.fromLocalDate(new Date())
    return (
      this.expirationDate !== null &&
      this.expirationDate.isAfter(today) &&
      !this.expirationDate.isAfter(today.add(maxCardValidity)) &&
      this.isStartDayBeforeExpirationDay(this.expirationDate)
    )
  }

  setExpirationDate(value: string) {
    if (value.length === 0) return
    try {
      this.expirationDate = PlainDate.fromCustomFormat(value, 'dd.MM.yyyy')
    } catch (error) {
      console.error(`Could not parse date from string '${value}' with format dd.MM.yyyy.`, error)
    }
  }

  isValid(): boolean {
    return (
      // Name valid
      this.isFullNameValid() &&
      // Extensions valid
      this.extensions.every(ext => ext.isValid()) &&
      // Expiration date valid
      (this.isExpirationDateValid() || this.hasInfiniteLifetime()) &&
      // Number of bytes is valid
      this.hasValidSize()
    )
  }

  hasValidSize(): boolean {
    // See https://github.com/digitalfabrik/entitlementcard/issues/690  for more context.

    const dynamicCode = new QrCode({
      qrCode: { value: this.generateActivationCode(), case: 'dynamicActivationCode' },
    }).toBinary()

    const staticCode = new QrCode({
      qrCode: { value: this.generateStaticVerificationCode(), case: 'staticVerificationCode' },
    }).toBinary()

    return isContentLengthValid(dynamicCode) && isContentLengthValid(staticCode)
  }

  generateCardInfo = (): CardInfo => {
    const extensionsMessage: PartialMessage<CardExtensions> = {}

    this.extensions.forEach(extension => {
      if (extension.state === null || !extension.setProtobufData) {
        // We allow to skip invalid extensions to enable computing the protobuf size.
        return
      }
      extension.setProtobufData(extensionsMessage)
    })

    const expirationDate = this.expirationDate
    const expirationDay =
      expirationDate !== null && !this.hasInfiniteLifetime()
        ? Math.max(expirationDate.toDaysSinceEpoch(), 0)
        : undefined

    return new CardInfo({
      fullName: this.fullName,
      expirationDay,
      extensions: new CardExtensions(extensionsMessage),
    })
  }

  generateActivationCode = (): DynamicActivationCode => {
    if (!window.isSecureContext) {
      // localhost is considered secure.
      throw Error('Environment is not considered secure nor are we using Internet Explorer.')
    }
    const pepper = new Uint8Array(PEPPER_LENGTH) // 128 bit randomness
    crypto.getRandomValues(pepper)

    const activationSecret = new Uint8Array(ACTIVATION_SECRET_LENGTH)
    crypto.getRandomValues(activationSecret)

    return new DynamicActivationCode({
      info: this.generateCardInfo(),
      pepper: pepper,
      activationSecret: activationSecret,
    })
  }

  generateStaticVerificationCode = (): StaticVerificationCode => {
    if (!window.isSecureContext) {
      // localhost is considered secure.
      throw Error('Environment is not considered secure nor are we using Internet Explorer.')
    }
    const pepper = new Uint8Array(PEPPER_LENGTH) // 128 bit randomness
    crypto.getRandomValues(pepper)

    return new StaticVerificationCode({
      info: this.generateCardInfo(),
      pepper: pepper,
    })
  }
}

export default CardBlueprint
