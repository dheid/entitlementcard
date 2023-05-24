import { Toaster } from '@blueprintjs/core'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import CSVCard from '../../cards/CSVCard'
import { Region } from '../../generated/graphql'
import { ProjectConfigProvider } from '../../project-configs/ProjectConfigContext'
import bayernConfig from '../../project-configs/bayern/config'
import { ProjectConfig } from '../../project-configs/getProjectConfig'
import nuernbergConfig from '../../project-configs/nuernberg/config'
import { AppToasterProvider } from '../AppToaster'
import { getHeaders } from './ImportCardsController'
import ImportCardsInput, { ENTRY_LIMIT } from './ImportCardsInput'

const wrapper = ({ children }: { children: ReactElement }) => (
  <AppToasterProvider>
    <ProjectConfigProvider>{children}</ProjectConfigProvider>
  </AppToasterProvider>
)

describe('ImportCardsInput', () => {
  const region: Region = {
    id: 0,
    name: 'augsburg',
    prefix: 'a',
  }

  const renderAndSubmitCardsInput = async (
    projectConfig: ProjectConfig,
    csv: string,
    lineToBlueprint: () => CSVCard,
    setCardBlueprints: () => void
  ) => {
    const file = new File([csv], projectConfig.name + '.csv', { type: 'text/csv' })
    const fileReaderSpy = jest.spyOn(global, 'FileReader').mockImplementation(function (this: FileReader) {
      this.readAsText = jest.fn(() => this.onloadend!({ target: { result: csv } } as ProgressEvent<FileReader>))
      return this
    })
    localStorage.setItem('project-override', projectConfig.projectId)

    const { getByTestId } = render(
      <ImportCardsInput
        headers={getHeaders(projectConfig)}
        lineToBlueprint={lineToBlueprint}
        setCardBlueprints={setCardBlueprints}
      />,
      { wrapper }
    )

    const fileInput = getByTestId('file-upload') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await act(async () => {
      fireEvent.input(fileInput)
      await waitFor(() => expect(fileReaderSpy.mock.instances[0].readAsText).toHaveBeenCalled())
    })
  }

  it.each([
    {
      projectConfig: bayernConfig,
      csv: `
Name,Ablaufdatum,Kartentyp
Thea Test,03.04.2024,Standard
Tilo Traber,,Gold
`,
    },
    {
      projectConfig: nuernbergConfig,
      csv: `
Name,Ablaufdatum,Geburtsdatum,Passnummer
Thea Test,03.04.2024,10.10.2000,12345678
Tilo Traber,03.04.2025,12.01.1984,98765432
`,
    },
  ])(`Correctly import CSV Card for project $projectConfig.name`, async ({ projectConfig, csv }) => {
    const toasterSpy = jest.spyOn(Toaster.prototype, 'show')
    const lineToBlueprintMock = jest.fn(() => new CSVCard(projectConfig.card, region))
    const setCardBlueprintsMock = jest.fn()

    await renderAndSubmitCardsInput(projectConfig, csv, lineToBlueprintMock, setCardBlueprintsMock)

    expect(toasterSpy).not.toHaveBeenCalled()
    expect(setCardBlueprintsMock).toHaveBeenCalled()
    expect(lineToBlueprintMock).toHaveBeenCalledTimes(2)
  })

  it.each([
    {
      csv: '',
      error: 'Die gewählte Datei ist leer.',
    },
    {
      csv: 'Name,Ablaufdatum,Kartentyp',
      error: 'Die Datei muss mindestens einen Eintrag enthalten.',
    },
    {
      csv: `
Name,Ablaufdatum,Kartentyp
Thea Test,03.04.2024,Standard
Tilo Traber,,,Gold
`,
      error: 'Keine gültige CSV Datei. Nicht jede Reihe enthält gleich viele Elemente.',
    },
    {
      csv: `
Name,Ablaufdatum,Geburtsdatum,Passnummer
${'Thea Test,03.04.2024,10.10.2000,12345678\n'.repeat(ENTRY_LIMIT + 1)}
`,
      error: `Die Datei hat mehr als ${ENTRY_LIMIT} Einträge.`,
    },
  ])(`Import CSV Card should fail with error '$error'`, async ({ csv, error }) => {
    const toasterSpy = jest.spyOn(Toaster.prototype, 'show')
    const lineToBlueprintMock = jest.fn(() => new CSVCard(bayernConfig.card, region))
    const setCardBlueprintsMock = jest.fn()

    await renderAndSubmitCardsInput(bayernConfig, csv, lineToBlueprintMock, setCardBlueprintsMock)

    expect(toasterSpy).toHaveBeenCalledWith({ intent: 'danger', message: error })
    expect(setCardBlueprintsMock).not.toHaveBeenCalled()
    expect(lineToBlueprintMock).not.toHaveBeenCalled()
  })
})