import { useState } from 'react'

import { WorkAtOrganizationInput } from '../../../generated/graphql'
import ConfirmDialog from '../ConfirmDialog'
import CustomDivider from '../CustomDivider'
import { useUpdateStateCallback } from '../hooks/useUpdateStateCallback'
import CheckboxForm from '../primitive-inputs/CheckboxForm'
import DateForm from '../primitive-inputs/DateForm'
import { FileRequirementsText, OptionalFileInputForm } from '../primitive-inputs/FileInputForm'
import NumberForm from '../primitive-inputs/NumberForm'
import ShortTextForm from '../primitive-inputs/ShortTextForm'
import { Form } from '../util/FormType'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundInitialState,
  createCompoundValidate,
} from '../util/compoundFormUtils'
import OrganizationForm from './OrganizationForm'

const ActivityDivider = ({ onDelete }: { onDelete?: () => void }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  return (
    <>
      <CustomDivider
        label='Ehrenamtliche Tätigkeit'
        onDelete={onDelete === undefined ? undefined : () => setDeleteDialogOpen(true)}
      />
      {onDelete === undefined ? null : (
        <ConfirmDialog
          open={deleteDialogOpen}
          onUpdateOpen={setDeleteDialogOpen}
          confirmButtonText='Löschen'
          content='Wollen Sie die Tätigkeit unwiderruflich löschen?'
          onConfirm={onDelete}
          title={'Tätigkeit löschen?'}
        />
      )}
    </>
  )
}

const amountOfWorkOptions = { min: 0, max: 100 }
const paymentOptions = { required: false } as const

const SubForms = {
  organization: OrganizationForm,
  amountOfWork: NumberForm,
  workSinceDate: DateForm,
  payment: CheckboxForm,
  responsibility: ShortTextForm,
  certificate: OptionalFileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = WorkAtOrganizationInput
type Options = {}
type AdditionalProps = { onDelete?: () => void }
const WorkAtOrganizationForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {
    amountOfWork: amountOfWorkOptions,
    payment: paymentOptions,
    workSinceDate: { maximumDate: null },
  }),
  Component: ({ state, setState, onDelete }) => (
    <>
      <ActivityDivider onDelete={onDelete} />
      <h4>Angaben zu Ihrer ehrenamtlichen Tätigkeit</h4>
      <SubForms.responsibility.Component
        state={state.responsibility}
        setState={useUpdateStateCallback(setState, 'responsibility')}
        label='Ehrenamtliche Tätigkeit'
      />
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: '2' }}>
          <SubForms.workSinceDate.Component
            label='Tätig seit'
            state={state.workSinceDate}
            setState={useUpdateStateCallback(setState, 'workSinceDate')}
            options={{ maximumDate: null }}
          />
        </div>
        <div style={{ flex: '3' }}>
          <SubForms.amountOfWork.Component
            label='Arbeitsstunden pro Woche (Durchschnitt)'
            state={state.amountOfWork}
            setState={useUpdateStateCallback(setState, 'amountOfWork')}
            options={amountOfWorkOptions}
            minWidth={250}
          />
        </div>
      </div>
      <SubForms.organization.Component
        state={state.organization}
        setState={useUpdateStateCallback(setState, 'organization')}
      />
      <SubForms.payment.Component
        state={state.payment}
        setState={useUpdateStateCallback(setState, 'payment')}
        label='Für diese ehrenamtliche Tätigkeit wurde eine Aufwandsentschädigung gewährt, die über den jährlichen Freibetrag hinaus geht (840 Euro Ehrenamtspauschale bzw. 3000 Euro Übungsleiterpauschale).'
        options={paymentOptions}
      />
      <h4>Tätigkeitsnachweis</h4>
      <p>
        Falls vorhanden, hängen Sie hier bitte einen eingescannten oder abfotografierten Tätigkeitsnachweis an.{' '}
        {FileRequirementsText}
      </p>
      <SubForms.certificate.Component
        state={state.certificate}
        setState={useUpdateStateCallback(setState, 'certificate')}
      />
    </>
  ),
}

export default WorkAtOrganizationForm
