import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Calendar, Plane } from "lucide-react"

const navItems = [
    { title: "FLIGHT SCHEDULE", icon: Calendar, isActive: true },
    { title: "FLEET MANAGEMENT", icon: Plane },
]

export function AppSidebar() {
    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="pt-8 pb-16 px-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white m-0 leading-none">SkyControl</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        className={`transition-colors py-6 pl-4 !rounded-none rounded-r-lg ${item.isActive ? '!bg-[#0A1128] transition-colors border-l-4 border-primary shadow-[inset_1px_0_0_0_transparent] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary' : 'hover:!bg-[#0A1128] hover:text-white'
                                            }`}
                                    >
                                        <a href="#" className="flex items-center gap-4 w-full h-full relative">
                                            <item.icon className={`h-[18px] w-[18px] ${item.isActive ? 'text-primary' : 'text-sidebar-foreground'} shrink-0`} />
                                            <span className={`font-semibold text-xs tracking-wide uppercase ${item.isActive ? 'text-white' : 'text-sidebar-foreground'}`}>
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}