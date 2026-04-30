export const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={`w-10 h-5 rounded-full relative transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-slate-200'} ${checked ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`}
    >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
)