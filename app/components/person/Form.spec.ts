import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import PersonForm from './Form.vue'

describe('PersonForm', () => {
  it('renders form component successfully', async () => {
    const wrapper = await mountSuspended(PersonForm)
    
    // Verify component mounts successfully
    expect(wrapper.exists()).toBe(true)
    
    // Check for basic form structure
    expect(wrapper.find('form').exists()).toBe(true)
    
    // Check that some form content is present (using more generic selectors)
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Save')
  })
})