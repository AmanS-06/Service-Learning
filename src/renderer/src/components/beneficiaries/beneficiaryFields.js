// The Beneficiary Form's fields, grouped into sections.
// Used by the form, the detail view and the CSV export so all three stay in step.
// Keys match the beneficiaries table / beneficiaryHandlers.js FIELDS list.

export const SEX_OPTIONS = ['Male', 'Female', 'Other']
export const YES_NO_OPTIONS = ['Yes', 'No']

export const BENEFICIARY_SECTIONS = [
  {
    title: 'Personal details',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'age', label: 'Age', type: 'number', kind: 'number' },
      { key: 'sex', label: 'Sex', type: 'select', options: SEX_OPTIONS },
      { key: 'education_qualification', label: 'Education qualification' },
      { key: 'occupation', label: 'Occupation' },
      { key: 'aadhar_pan', label: 'Aadhar card / PAN card' },
      { key: 'address', label: 'Address', type: 'textarea', full: true }
    ]
  },
  {
    title: 'Contact',
    fields: [
      { key: 'contact_no', label: 'Contact no.', type: 'tel', kind: 'phone' },
      { key: 'alternate_contact_no', label: 'Alternate contact no.', type: 'tel', kind: 'phone' }
    ]
  },
  {
    title: 'Income',
    fields: [
      {
        key: 'income_before_lp',
        label: 'Personal monthly income before joining LP (₹)',
        type: 'number',
        kind: 'money'
      },
      {
        key: 'income_after_lp',
        label: 'Personal monthly income after joining LP (₹)',
        type: 'number',
        kind: 'money'
      }
    ]
  },
  {
    title: 'Programme',
    fields: [
      {
        key: 'associated_before_lp',
        label: 'Associated with Purnkuti before joining LP',
        type: 'select',
        options: YES_NO_OPTIONS
      },
      { key: 'year', label: 'Year', placeholder: 'e.g. 2025' },
      { key: 'joining_date', label: 'Joining date', type: 'date', kind: 'date' },
      { key: 'courses_completed', label: 'No. of courses completed', type: 'number', kind: 'number' },
      { key: 'course_names', label: 'Name(s) of the course', type: 'textarea', full: true }
    ]
  },
  {
    title: 'Work',
    fields: [
      { key: 'work_experience', label: 'Work experience' },
      { key: 'work_profile', label: 'Work profile' },
      { key: 'designation', label: 'Designation' },
      { key: 'reporting_to', label: 'Reporting to' },
      { key: 'expert', label: 'Expert' },
      { key: 'skills', label: 'Skills', type: 'textarea', full: true }
    ]
  }
]

export const BENEFICIARY_FIELDS = BENEFICIARY_SECTIONS.flatMap((section) => section.fields)
