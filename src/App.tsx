import { useEffect, useState } from "react";
import { Button, Label, Textarea } from "./components/ui";
import { Delete } from "lucide-react";

export default function App() {

  const [inputJSON, setInputJSON] = useState({})
  const [savedJSON,setSavedJSON] = useState({})

  useEffect(()=>{
    const savedVal=localStorage.getItem("swagger-auth-help-JSON")
    setSavedJSON(savedVal!)
  },[])

  async function saveJSONToLocalStorage(){
    await setSavedJSON(inputJSON)
    await localStorage.clear()
    await localStorage.setItem("swagger-auth-help-JSON",JSON.stringify(savedJSON))
  }

  return (
    <div className="p-2 w-[300px] flex space-y-4 flex-col font-mono">
      <div className="flex justify-between items-center">
        <img src="/images/icon-32.png" alt="Swagger_Auth_Help icon" />
        <p className="font-bold">Swagger Help</p>
      </div>
      
      <div>
        <Label>Saved Value</Label>
        <div className="flex space-x-4 items-center">
          <Textarea readOnly value={JSON.stringify(savedJSON)} />
          <Delete onClick={()=>{
            localStorage.clear()
            setSavedJSON({})
            }} />
        </div>
      </div>

      <div className="">
        <Label htmlFor="inputJSON">Input JSON</Label>  
        <Textarea rows={6} onChange={(ev)=>setInputJSON(ev.target.value)}/>
      </div>
      <div className="flex items-center justify-around">
        <Button onClick={()=>saveJSONToLocalStorage()}>Save</Button>
      </div>
    </div>
  )
}