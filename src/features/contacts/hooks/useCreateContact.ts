'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createContact } from '@/features/contacts/api/contactsClient'

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
