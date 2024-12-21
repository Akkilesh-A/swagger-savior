import {  useEffect, useState } from "react";
import { Button, Label, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Input } from "./components/ui";
import {  Trash2 } from "lucide-react";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components";

export default function App() {

  const [inputJSON,setInputJSON] = useState("")
  const [protocol,setProtocol]=useState("https")
  const [backendURL, setbackendURL] = useState("")

  useEffect(()=>{
    const savedJSON=localStorage.getItem("swagger-auth-help-JSON")
    if(savedJSON){
      setInputJSON(JSON.parse(savedJSON!))
    }
    const savedBackendURL= localStorage.getItem("swagger-auth-help-BackendURL")
    if(savedBackendURL){
      const backendLink=savedBackendURL.split('"')[1]
      setbackendURL(backendLink!)
    }
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
        https.click()
        const protocolOption=https.querySelector(`option[value=${protocol}]`) as HTMLOptionElement
        // https.value=protocol
        protocolOption.click()

        //Authorize modal open
        const authorizeButton=document.getElementsByClassName("authorize")[0] as HTMLElement
        authorizeButton.click()

        //Get the form
        const form=ui?.firstElementChild?.lastElementChild?.lastElementChild?.lastElementChild?.firstElementChild?.firstElementChild?.lastElementChild?.lastElementChild?.firstElementChild as HTMLFormElement
        console.log(form)

        //Get Input box
        const searchBox=form?.firstElementChild?.firstElementChild?.lastElementChild?.lastElementChild?.firstElementChild as HTMLInputElement
        searchBox.value="Bearer "+token
        console.log(searchBox.value)
        
        //Click on auhtorize button
        const authorize=form?.lastElementChild?.firstElementChild as HTMLButtonElement
        console.log(authorize)

          // Trigger the 'input' event
        const inputEvent = new Event('input', { bubbles: true });
        searchBox.dispatchEvent(inputEvent);

        // Trigger the 'change' event
        const changeEvent = new Event('change', { bubbles: true });
        searchBox.dispatchEvent(changeEvent);
        // authorize.click()

        if (authorize) {
          setTimeout(() => {
            // Ensure the button is not disabled
            if (authorize.disabled) {
              authorize.disabled = false;
            }
        
            // Simulate a user click
            authorize.click();
            console.log("Authorize button clicked");
          }, 500); // Adjust the timeout if needed
        }

        console.log("finished")
      },
      args:[protocol,backendURL,jsonValue]
    })
  }

  async function saveJSONToLocalStorage(){
    await localStorage.setItem("swagger-auth-help-JSON",JSON.stringify(inputJSON))
    await localStorage.setItem("swagger-auth-help-BackendURL",JSON.stringify(backendURL))
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-2 w-[300px] flex space-y-4 flex-col font-mono">
        <nav className="flex justify-between items-center">
          <img src="/images/icon-32.png" alt="Swagger_Auth_Help icon" />
          <p className="font-extrabold">Swagger Auth Help</p>
          <ModeToggle />
        </nav>

        <div className="flex justify-between items-center">
          <Label htmlFor="protocol">Protocol</Label>  
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
          <Label htmlFor="backendURL">Backend URL</Label>  
            <Trash2 className="cursor-pointer" onClick={()=>{
                localStorage.removeItem("swagger-auth-help-BackendURL")
                setbackendURL("")
                }} />
          </div>
          <Input defaultValue={backendURL} onChange={(ev)=>setbackendURL(ev.target.value)}/>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="inputJSON">Input JSON</Label>  
            <Trash2 className="cursor-pointer" onClick={()=>{
                localStorage.removeItem("swagger-auth-help-JSON")
                setInputJSON("")
                }} />
          </div>
          <Textarea defaultValue={inputJSON} rows={6} onChange={(ev)=>setInputJSON(ev.target.value)}/>
        </div>

        <div className="flex items-center justify-around">
          <Button onClick={()=>saveJSONToLocalStorage()}>Save</Button>
          <Button onClick={()=>onclick(protocol,backendURL,inputJSON)}>Login</Button>
        </div>
      </div>
    </ThemeProvider>
  )
}