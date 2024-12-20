import { useEffect, useState } from "react";
import { Button, Label, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./components/ui";
import { Delete } from "lucide-react";

export default function App() {

  const [inputJSON, setInputJSON] = useState("")
  const [savedJSON,setSavedJSON] = useState("")
  const [protocol,setProtocol]=useState("https")
  const [backendURL, setbackendURL] = useState("")

  useEffect(()=>{
    const savedVal=localStorage.getItem("swagger-auth-help-JSON")
    setSavedJSON(savedVal!)
  },[])


  async function onclick(protocol:string,backendURL:string,jsonValue:string){
    const [tab]=await chrome.tabs.query({active:true})
    chrome.scripting.executeScript({
      target:{tabId:tab.id!},
      func:async (protocol,backendURL,jsonValue) => {
        const backendLink=backendURL
        console.log(backendLink)
        const response=await fetch(backendLink,{
          headers: {
            "Content-Type": "application/json",
          },
          method:"POST",
          body:jsonValue
        })
        const result=await response.json()
        console.log(result.data.accessToken)
        const token=result.data.accessToken

        //Schemes and Authorize button bar
        const ui=document.body.firstElementChild?.firstElementChild?.getElementsByClassName("swagger-ui")[0].lastElementChild?.getElementsByClassName("scheme-container")[0]

        //Select https in dropdown menu
        const https=ui?.firstElementChild?.firstElementChild?.lastElementChild as HTMLSelectElement
        https.value=protocol

        //Authorize modal open
        const authorizeButton=document.getElementsByClassName("authorize")[0] as HTMLElement
        authorizeButton.click()

        //Get the form
        const form=ui?.firstElementChild?.lastElementChild?.lastElementChild?.lastElementChild?.firstElementChild?.firstElementChild?.lastElementChild?.lastElementChild?.firstElementChild
        console.log(form)

        //Get Input box
        const searchBox=form?.firstElementChild?.firstElementChild?.lastElementChild?.lastElementChild?.firstElementChild as HTMLInputElement
        searchBox.value=token

        //Click on auhtorize button
        const authorize=form?.lastElementChild?.firstElementChild as HTMLElement
        console.log(authorize)
        authorize.click()
        console.log("finished")
      },
      args:[protocol,backendURL,jsonValue]
    })
  }

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
            setSavedJSON("")
            }} />
        </div>
      </div>


      <div>
        <Select defaultValue="https" onValueChange={(value)=>setProtocol(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Protocol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="https">HTTPS</SelectItem>
            <SelectItem value="http">HTTP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="">
        <Label htmlFor="backendURL">Backend URL</Label>  
        <Textarea rows={6} onChange={(ev)=>setbackendURL(ev.target.value)}/>
      </div>
      
      <div className="">
        <Label htmlFor="inputJSON">Input JSON</Label>  
        <Textarea rows={6} onChange={(ev)=>setInputJSON(ev.target.value)}/>
      </div>

      <div className="flex items-center justify-around">
        <Button onClick={()=>saveJSONToLocalStorage()}>Save</Button>
        <Button onClick={()=>onclick(protocol,backendURL,savedJSON)}>Login</Button>
      </div>
    </div>
  )
}