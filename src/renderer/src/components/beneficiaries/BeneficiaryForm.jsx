import { useState } from 'react'

const EMPTY_FORM = {
  name: '',
  age: '',
  education_qualification: '',
  sex: '',
  occupation: '',
  contact_no: '',
  alternate_contact_no: '',
  income_before_lp: '',
  income_after_lp: '',
  address: '',
  associated_before_lp: '',
  year: '',
  courses_completed: '',
  course_names: '',
  joining_date: '',
  work_experience: '',
  skills: '',
  aadhar_pan: '',
  work_profile: '',
  expert: '',
  designation: '',
  reporting_to: ''
}

const FIELD_LABELS = {
  name: 'Name',
  age: 'Age',
  education_qualification: 'Education Qualification',
  sex: 'Sex',
  occupation: 'Occupation',
  contact_no: 'Contact No.',
  alternate_contact_no: 'Alternate Contact No.',
  income_before_lp: 'Personal Monthly Income (Before Joining LP)',
  income_after_lp: 'Personal Monthly Income (After Joining LP)',
  address: 'Address',
  associated_before_lp: 'Associated With Purnkuti Before Joining LP',
  year: 'Year',
  courses_completed: 'No. of Courses Completed',
  course_names: 'Name(s) of the Course',
  joining_date: 'Joining Date',
  work_experience: 'Work Experience',
  skills: 'Skills',
  aadhar_pan: 'Aadhar Card / Pan Card',
  work_profile: 'Work Profile',
  expert: 'Expert',
  designation: 'Designation',
  reporting_to: 'Reporting To'
}

export default function BeneficiaryForm({ initialData, onSaved, onCancel }) {
  const isEdit = Boolean(initialData && initialData.id)
  const [form, setForm] = useState(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    let result
    if (isEdit) {
      result = await window.api.beneficiaries.update(initialData.id, form)
    } else {
      result = await window.api.beneficiaries.create(form)
    }
    setSaving(false)
    onSaved(result)
  }

  return (
    <form className="beneficiary-form" onSubmit={handleSubmit}>
      {Object.keys(EMPTY_FORM).map((field) => (
        <div className="form-field" key={field}>
          <label htmlFor={field}>{FIELD_LABELS[field]}</label>
          <input
            id={field}
            type="text"
            value={form[field] ?? ''}
            onChange={handleChange(field)}
          />
        </div>
      ))}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving' : isEdit ? 'Update Beneficiary' : 'Add Beneficiary'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}