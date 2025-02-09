import { Alert, Button } from '@mui/material'
import { useCallback, useMemo } from 'react'

import { BlueCardWorkAtOrganizationsEntitlementInput } from '../../../generated/graphql'
import CustomDivider from '../CustomDivider'
import { SetState } from '../hooks/useUpdateStateCallback'
import { Form } from '../util/FormType'
import { InferState } from '../util/compoundFormUtils'
import WorkAtOrganizationForm from './WorkAtOrganizationForm'

type WorkAtOrganizationFormState = InferState<typeof WorkAtOrganizationForm>

const WorkAtOrganizationFormHelper = ({
  listKey,
  setStateByKey,
  deleteByKey,
  ...otherProps
}: {
  listKey: number
  setStateByKey: (key: number) => SetState<WorkAtOrganizationFormState>
  deleteByKey?: (key: number) => void
  state: WorkAtOrganizationFormState
}) => {
  const setState = useMemo(() => setStateByKey(listKey), [setStateByKey, listKey])
  const onDelete = useMemo(
    () => (deleteByKey === undefined ? undefined : () => deleteByKey(listKey)),
    [deleteByKey, listKey]
  )
  return <WorkAtOrganizationForm.Component setState={setState} onDelete={onDelete} {...otherProps} />
}

function replaceAt<T>(array: T[], index: number, newItem: T): T[] {
  const newArray = [...array]
  newArray[index] = newItem
  return newArray
}

function removeAt<T>(array: T[], index: number): T[] {
  const newArray = [...array]
  newArray.splice(index, 1)
  return newArray
}

type State = { key: number; value: WorkAtOrganizationFormState }[]
type ValidatedInput = BlueCardWorkAtOrganizationsEntitlementInput
type Options = {}
type AdditionalProps = {}
const WorkAtOrganizationsEntitlementForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: [{ key: 0, value: WorkAtOrganizationForm.initialState }],
  getArrayBufferKeys: state => state.map(({ value }) => WorkAtOrganizationForm.getArrayBufferKeys(value)).flat(),
  validate: state => {
    const validationResults = state.map(({ value }) => WorkAtOrganizationForm.validate(value))
    if (validationResults.some(({ type }) => type === 'error')) {
      return { type: 'error' }
    }
    return {
      type: 'valid',
      value: {
        list: validationResults.map(x => {
          if (x.type !== 'valid') {
            throw Error('Found an invalid entry despite previous validity check.')
          }
          return x.value
        }),
      },
    }
  },
  Component: ({ state, setState }) => {
    const addActivity = () =>
      setState(state => {
        const newKey = Math.max(...state.map(({ key }) => key), 0) + 1
        return [...state, { key: newKey, value: WorkAtOrganizationForm.initialState }]
      })

    const setStateByKey: (key: number) => SetState<WorkAtOrganizationFormState> = useCallback(
      key => update =>
        setState(state => {
          const index = state.findIndex(element => element.key === key)
          return replaceAt(state, index, { key, value: update(state[index].value) })
        }),
      [setState]
    )

    const deleteByKey = useMemo(() => {
      if (state.length <= 1) return undefined
      return (key: number) =>
        setState(state =>
          removeAt(
            state,
            state.findIndex(item => item.key === key)
          )
        )
    }, [state.length, setState])

    return (
      <>
        {state.map(({ key, value }) => (
          <WorkAtOrganizationFormHelper
            key={key}
            listKey={key}
            state={value}
            deleteByKey={deleteByKey}
            setStateByKey={setStateByKey}
          />
        ))}
        <CustomDivider />
        {state.length < 5 ? (
          <Button onClick={addActivity}>Weitere Tätigkeit hinzufügen</Button>
        ) : (
          <Alert severity='info'>Maximale Anzahl an Tätigkeiten erreicht.</Alert>
        )}
      </>
    )
  },
}

export default WorkAtOrganizationsEntitlementForm
