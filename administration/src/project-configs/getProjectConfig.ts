import { ReactElement } from 'react'
import bayernConfig from './bayern/config'
import nuernbergConfig from './nuernberg/config'
import showcaseConfig from './showcase/config'
import { CardBlueprint } from '../cards/CardBlueprint'
import { Region } from '../generated/graphql'
import { CardInfo } from '../generated/card_pb'

export interface PdfConfig {
  title: string
  templatePath: string | null
  issuer: string
  infoToDetails: (info: CardInfo, region: Region, shorten: boolean) => string
}

export interface ProjectConfig {
  name: string
  projectId: string
  applicationFeatureEnabled: boolean
  staticQrCodesEnabled: boolean
  createEmptyCard: (region: Region) => CardBlueprint
  dataPrivacyHeadline: string
  dataPrivacyContent: () => ReactElement
  pdf: PdfConfig
}

export const setProjectConfigOverride = (hostname: string) => {
  window.localStorage.setItem('project-override', hostname)
}

const getProjectConfig = (hostname: string): ProjectConfig => {
  switch (window.localStorage.getItem('project-override') ?? hostname) {
    case 'bayern.ehrenamtskarte.app':
      return bayernConfig
    case 'nuernberg.sozialpass.app':
      return nuernbergConfig
    default:
      console.debug('Falling back to showcase.')
      return showcaseConfig
  }
}

export default getProjectConfig