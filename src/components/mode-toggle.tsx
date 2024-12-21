import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui"

export function ModeToggle() {
  const { theme,setTheme } = useTheme()

  return (
      <Button onClick={()=>{
        if(theme=="dark"){
          setTheme("light")
        }else{
          setTheme("dark")
        }
      }} variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-180 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
  )
}