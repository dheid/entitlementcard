import { Button, Card, Tooltip } from '@blueprintjs/core'
import React, { useContext, useState } from 'react'
import FlipMove from 'react-flip-move'
import styled from 'styled-components'

import { CardBlueprint } from '../../cards/CardBlueprint'
import { Region } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import useBlockNavigation from '../../util/useBlockNavigation'
import AddEakButton from './AddEakButton'
import CreateCardForm from './CreateCardForm'

const ButtonBar = styled(({ stickyTop: number, ...rest }) => <Card {...rest} />)<{ stickyTop: number }>`
  width: 100%;
  padding: 15px;
  background: #fafafa;
  position: sticky;
  z-index: 1;
  top: ${props => props.stickyTop}px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & button {
    margin: 5px;
  }
`

const FormsWrapper = styled(FlipMove)`
  padding: 10px;
  width: 100%;
  z-index: 0;
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
`

const FormColumn = styled.div`
  width: 400px;
  margin: 10px;
  box-sizing: border-box;
`

interface Props {
  region: Region
  cardBlueprints: CardBlueprint[]
  setCardBlueprints: (blueprints: CardBlueprint[]) => void
  confirm: () => void
}

const CreateCardsForm = (props: Props) => {
  const { cardBlueprints, setCardBlueprints, region } = props
  const projectConfig = useContext(ProjectConfigContext)
  const [isModified, setModified] = useState(false)

  const addForm = () => {
    setCardBlueprints([...cardBlueprints, projectConfig.createEmptyCard(region)])
    setModified(true)
  }
  const removeCardBlueprint = (oldBlueprint: CardBlueprint) => {
    setCardBlueprints(cardBlueprints.filter(blueprint => blueprint !== oldBlueprint))
    setModified(true)
  }
  const notifyUpdate = () => {
    setCardBlueprints([...cardBlueprints])
    setModified(true)
  }

  const allCardsValid = cardBlueprints.every(blueprint => blueprint.isValid())

  useBlockNavigation({ when: isModified, message: 'Falls Sie fortfahren, werden alle Eingaben verworfen.' })

  return (
    <>
      <ButtonBar stickyTop={0}>
        <Tooltip>
          <Button
            icon='export'
            text='QR-Codes drucken'
            intent='success'
            onClick={props.confirm}
            disabled={!allCardsValid || cardBlueprints.length === 0}
          />
          {!allCardsValid && 'Mindestens eine Karte enthält ungültige Eingaben.'}
          {cardBlueprints.length === 0 && 'Legen Sie zunächst eine Karte an.'}
        </Tooltip>
      </ButtonBar>
      {/* @ts-ignore */}
      <FormsWrapper>
        {cardBlueprints.map(blueprint => (
          <FormColumn key={blueprint.id}>
            <CreateCardForm
              cardBlueprint={blueprint}
              onRemove={() => removeCardBlueprint(blueprint)}
              onUpdate={() => {
                notifyUpdate()
              }}
            />
          </FormColumn>
        ))}
        <FormColumn key='AddButton'>
          <AddEakButton onClick={addForm} />
        </FormColumn>
      </FormsWrapper>
    </>
  )
}

export default CreateCardsForm