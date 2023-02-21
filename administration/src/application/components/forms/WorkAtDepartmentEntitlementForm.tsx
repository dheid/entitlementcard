import { BlueCardWorkAtDepartmentEntitlementInput } from '../../../generated/graphql'
import { useUpdateStateCallback } from '../../useUpdateStateCallback'
import { Form } from '../../FormType'
import ShortTextForm from '../primitive-inputs/ShortTextForm'
import FileInputForm, { FileRequirementsText } from '../primitive-inputs/FileInputForm'
import CustomDivider from '../CustomDivider'
import OrganizationForm from './OrganizationForm'
import {
  CompoundState,
  createCompoundGetArrayBufferKeys,
  createCompoundValidate,
  createCompoundInitialState,
} from '../../compoundFormUtils'

const SubForms = {
  organization: OrganizationForm,
  responsibility: ShortTextForm,
  certificate: FileInputForm,
}

type State = CompoundState<typeof SubForms>
type ValidatedInput = BlueCardWorkAtDepartmentEntitlementInput
type Options = {}
type AdditionalProps = {}
const WorkAtDepartmentEntitlementForm: Form<State, Options, ValidatedInput, AdditionalProps> = {
  initialState: createCompoundInitialState(SubForms),
  getArrayBufferKeys: createCompoundGetArrayBufferKeys(SubForms),
  validate: createCompoundValidate(SubForms, {}),
  Component: ({ state, setState }) => (
    <>
      <CustomDivider label='Angaben zur Tätigkeit' />
      <SubForms.organization.Component
        state={state.organization}
        setState={useUpdateStateCallback(setState, 'organization')}
      />
      <SubForms.responsibility.Component
        label='Funktion oder Tätigkeit'
        state={state.responsibility}
        setState={useUpdateStateCallback(setState, 'responsibility')}
      />
      <h4>Tätigkeitsnachweis</h4>
      <p>
        Hängen Sie hier bitte einen eingescannten oder abfotografierten Tätigkeitsnachweis an. {FileRequirementsText}
      </p>
      <SubForms.certificate.Component
        state={state.certificate}
        setState={useUpdateStateCallback(setState, 'certificate')}
      />
    </>
  ),
}

export default WorkAtDepartmentEntitlementForm
