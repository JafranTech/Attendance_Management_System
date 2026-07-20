import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Label } from '../ui/Label'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAddStudent } from '../../hooks/useStudents'

const schema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  batch: z.string().optional(),
})

export function AddStudentModal({ isOpen, onClose, courseId }) {
  const addStudent = useAddStudent(courseId)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await addStudent.mutateAsync(data)
      toast.success('Student added successfully!')
      reset()
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rollNumber">Roll Number *</Label>
          <Input id="rollNumber" placeholder="e.g. 21CS001" {...register('rollNumber')}
            className={errors.rollNumber ? 'border-red-400' : ''} />
          {errors.rollNumber && <p className="text-xs text-red-500">{errors.rollNumber.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="e.g. Arjun Sharma" {...register('name')}
            className={errors.name ? 'border-red-400' : ''} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="student@college.edu" {...register('email')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch">Batch</Label>
          <Input id="batch" placeholder="e.g. 2021-25" {...register('batch')} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={addStudent.isPending}>
            {addStudent.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
