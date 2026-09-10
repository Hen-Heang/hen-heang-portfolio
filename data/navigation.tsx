// data/navigation.tsx
import React from "react"
import { Code, User, Briefcase, BarChart, BookOpen, Sparkles } from "lucide-react"
import type { NavItem } from "@/src/lib/types"

export const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Code size={18} /> },
    { id: "about", label: "About", icon: <User size={18} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
    { id: "projects", label: "Projects", icon: <Sparkles size={18} /> },
    { id: "ai-engineering", label: "AI Library", icon: <BookOpen size={18} /> },
    { id: "skills", label: "Skills", icon: <BarChart size={18} /> },
]
