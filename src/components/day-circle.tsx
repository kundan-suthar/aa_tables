export const DayCircle = ({ active, label }: { active: boolean, label: string }) => (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${active
        ? 'bg-[#5c59f2] text-white'
        : 'bg-[#f1f5f9] text-[#94a3b8]'
        }`}>
        {label}
    </div>
)