import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Label } from '../ui/Label'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCreateCourse } from '../../hooks/useCourses'

const schema = z.object({
  courseCode: z.string().min(1, 'Course code is required').max(20),
  courseName: z.string().min(2, 'Course name is required').max(100),
  semester: z.string().optional(),
})

export function AddCourseModal({ isOpen, onClose }) {
  const createCourse = useCreateCourse()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await createCourse.mutateAsync(data)
      toast.success('Course created successfully!')
      reset()
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Course">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="courseCode">Course Code *</Label>
          <Input
            id="courseCode"
            placeholder="e.g. CS301"
            {...register('courseCode')}
            className={errors.courseCode ? 'border-red-400' : ''}
          />
          {errors.courseCode && <p className="text-xs text-red-500">{errors.courseCode.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="courseName">Course Name *</Label>
          <Input
            id="courseName"
            placeholder="e.g. Data Structures & Algorithms"
            {...register('courseName')}
            className={errors.courseName ? 'border-red-400' : ''}
          />
          {errors.courseName && <p className="text-xs text-red-500">{errors.courseName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            placeholder="e.g. 5"
            {...register('semester')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={createCourse.isPending}>
            {createCourse.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
            ) : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
