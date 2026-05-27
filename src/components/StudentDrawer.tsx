import { Sheet, SheetContent } from './ui/sheet';
import StudentSelector from './StudentSelector';
import type { StudentInfo } from '@/types/student';

interface StudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentInfo[];
  onSelect: (studentId: number) => void;
  selectedStudentId?: number | null;
  year: number;
}

function StudentDrawer({
  open,
  onOpenChange,
  students,
  onSelect,
  selectedStudentId,
  year,
}: StudentDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-base font-semibold">학생 선택</h2>
        </div>
        <div className="p-4">
          <StudentSelector
            students={students}
            selectedStudentId={selectedStudentId ?? null}
            year={year}
            onSelect={(id) => {
              onSelect(id);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default StudentDrawer;
