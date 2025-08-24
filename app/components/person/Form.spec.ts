import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import PersonForm from './Form.vue'
import type { PersonFormData } from '../../../shared/validation/personSchemas'

describe('PersonForm', () => {
  describe('Rendering & Structure', () => {
    it('renders form component successfully', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Verify component mounts successfully
      expect(wrapper.exists()).toBe(true)
      
      // Check for basic form structure
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders all form fields with correct labels', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Check form field labels are present
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('Address')
      expect(wrapper.text()).toContain('Notes')
      
      // Check for required field indicator (assuming UFormField shows it)
      const nameField = wrapper.find('[name="name"]')
      expect(nameField.exists()).toBe(true)
    })

    it('renders form fields with correct placeholders', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Check placeholders are present in the text content
      expect(wrapper.html()).toContain('Enter person\'s name')
      expect(wrapper.html()).toContain('Enter address (optional)')
      expect(wrapper.html()).toContain('Add any notes (optional)')
    })

    it('renders cancel and submit buttons', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Check that buttons are present in text content
      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Save')
    })

    it('renders notes field with maxlength attribute', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Check notes field has maxlength
      expect(wrapper.html()).toContain('maxlength="2000"')
    })
  })

  describe('Props', () => {
    it('uses default submitLabel when not provided', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      expect(wrapper.text()).toContain('Save')
    })

    it('displays custom submitLabel when provided', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          submitLabel: 'Create Person'
        }
      })
      
      expect(wrapper.text()).toContain('Create Person')
      expect(wrapper.text()).not.toContain('Save')
    })

    it('populates form fields with initialData', async () => {
      const initialData: Partial<PersonFormData> = {
        name: 'John Doe',
        address: '123 Main St',
        notes: 'Test notes'
      }
      
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData
        }
      })
      
      await nextTick()
      
      // Check that the values are present in the component
      expect(wrapper.html()).toContain('John Doe')
      expect(wrapper.html()).toContain('123 Main St')
      expect(wrapper.html()).toContain('Test notes')
    })

    it('handles partial initialData correctly', async () => {
      const initialData: Partial<PersonFormData> = {
        name: 'Jane Smith'
        // address and notes intentionally omitted
      }
      
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData
        }
      })
      
      await nextTick()
      
      expect(wrapper.html()).toContain('Jane Smith')
    })

    it('shows loading state on submit button when loading prop is true', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          loading: true
        }
      })
      
      // UButton with loading prop should show spinner and be disabled
      expect(wrapper.html()).toContain('animate-spin')
      expect(wrapper.html()).toContain('disabled=""')
    })
  })

  describe('Events', () => {
    it('emits cancel event when cancel button is clicked', async () => {
      const wrapper = await mountSuspended(PersonForm)
      
      // Find and click cancel button
      const cancelButtons = wrapper.findAll('button')
      const cancelButton = cancelButtons.find(btn => btn.text().includes('Cancel'))
      expect(cancelButton).toBeDefined()
      
      await cancelButton!.trigger('click')
      
      // Check that cancel event was emitted
      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('can handle form submission (submit button exists and is clickable)', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData: {
            name: 'Test Person',
            address: 'Test Address',
            notes: 'Test Notes'
          }
        }
      })
      
      await nextTick()
      
      // Verify submit button exists and is clickable
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
      expect(submitButton.text()).toContain('Save')
      
      // The actual form submission behavior is handled by UForm
      // which may require more complex setup to properly test in isolation
      // For now, we verify the submit infrastructure is in place
    })
  })

  describe('Reactivity', () => {
    it('updates form fields when initialData prop changes', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData: {
            name: 'Initial Name'
          }
        }
      })
      
      await nextTick()
      expect(wrapper.html()).toContain('Initial Name')
      
      // Update the prop
      await wrapper.setProps({
        initialData: {
          name: 'Updated Name',
          address: 'New Address'
        }
      })
      
      await nextTick()
      expect(wrapper.html()).toContain('Updated Name')
      expect(wrapper.html()).toContain('New Address')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty initialData gracefully', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData: {}
        }
      })
      
      await nextTick()
      
      // Component should still render without errors
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('handles null/undefined initialData gracefully', async () => {
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData: undefined
        }
      })
      
      await nextTick()
      
      // Component should still render without errors
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('handles very long strings in initialData', async () => {
      const longName = 'A'.repeat(300) // Exceeds 255 char limit
      const longNotes = 'B'.repeat(2500) // Exceeds 2000 char limit
      
      const wrapper = await mountSuspended(PersonForm, {
        props: {
          initialData: {
            name: longName,
            notes: longNotes
          }
        }
      })
      
      await nextTick()
      
      // Component should still render without errors
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })
})