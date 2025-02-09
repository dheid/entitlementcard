import { BavariaCardType } from '../generated/card_pb'
import PlainDate from '../util/PlainDate'
import CardBlueprint from './CardBlueprint'
import BavariaCardTypeExtension from './extensions/BavariaCardTypeExtension'
import RegionExtension from './extensions/RegionExtension'

jest.useFakeTimers({ now: new Date('2020-01-01') })

describe('CardBlueprint', () => {
  const region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
    activatedForApplication: true,
  }

  const cardConfig = {
    defaultValidity: { years: 3 },
    nameColumnName: 'Name',
    expiryColumnName: 'Ablaufdatum',
    extensionColumnNames: ['Kartentyp', null],
    extensions: [BavariaCardTypeExtension, RegionExtension],
  }

  it('should correctly initialize CardBlueprint', () => {
    const card = new CardBlueprint('Thea Test', cardConfig, [region])

    expect(card.fullName).toBe('Thea Test')
    expect(card.expirationDate).toEqual(PlainDate.from('2023-01-01'))
    expect(card.extensions[0].state).toBe('Standard')
    expect(card.extensions[1].state).toEqual({ regionId: 0 })
  })

  it('should generate CardInfo even with invalid expiration date', () => {
    const card = new CardBlueprint('', cardConfig, [region])
    card.expirationDate = PlainDate.from('1900-01-01')
    expect(card.generateCardInfo().toJson({ enumAsInteger: true }) as object).toEqual({
      fullName: '',
      expirationDay: 0,
      extensions: {
        extensionRegion: {
          regionId: 0,
        },
        extensionBavariaCardType: {
          cardType: BavariaCardType.STANDARD,
        },
      },
    })
    expect(card.hasValidSize()).toBe(true)
  })
})
