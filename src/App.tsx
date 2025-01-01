import {  useEffect, useState } from "react";
import { Button, Label, Textarea, Input } from "./components/ui";
import {  Trash2 } from "lucide-react";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components";

export default function App() {

  const [inputJSON,setInputJSON] = useState("")
  const [backendURL, setbackendURL] = useState("")
  const [tokenName,setTokenName] = useState("")

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
    const savedTokenName=localStorage.getItem("swagger-auth-help-Token-Name")
    if(savedTokenName){
      const savedTokenNameVal=savedTokenName.split('"')[1]
      setTokenName(savedTokenNameVal!)
    }
  },[])

  async function onclick(backendURL:string,jsonValue:string,tokenName:string){
    const [tab]=await chrome.tabs.query({active:true})
    chrome.scripting.executeScript({
      target:{tabId:tab.id!},
      func:async (backendURL,jsonValue,tokenName) => {       
        const backendLink=backendURL
        const response=await fetch(backendLink,{
          headers: {
            "Content-Type": "application/json",
          },
          method:"POST",
          body:jsonValue
        })
        if(response){
          const result=await response.json()
          const token=result.data[tokenName]

          //Schemes and Authorize button bar
          const scheme_container=document.body.querySelector(".swagger-ui .scheme-container")
          console.log(scheme_container)

          //Authorize modal open
          const authorizeButton=document.getElementsByClassName("authorize")[0] as HTMLElement
          authorizeButton.click()

          //Get the form "model-ux-content"
          const form=scheme_container?.querySelector(".schemes .auth-wrapper .modal-ux-content")?.lastElementChild?.firstElementChild as HTMLFormElement
          console.log(form) 

          //Get Input box
          const searchBox=form?.firstElementChild?.firstElementChild?.lastElementChild?.lastElementChild?.firstElementChild as HTMLInputElement
          searchBox.value="Bearer "+token
          
          //Click on authorize button
          const authorize=form?.lastElementChild?.firstElementChild as HTMLButtonElement

          // Trigger the 'input' event
          const inputEvent = new Event('input', { bubbles: true });
          searchBox.dispatchEvent(inputEvent);

          // Trigger the 'change' event
          const changeEvent = new Event('change', { bubbles: true });
          searchBox.dispatchEvent(changeEvent);

          if (authorize) {
            setTimeout(() => {
              // Ensure the button is not disabled
              if (authorize.disabled) {
                authorize.disabled = false;
              }
          
              // Simulate a user click
              authorize.click();

              //Close the modal
              const modalClose=scheme_container?.firstElementChild?.lastElementChild?.lastElementChild?.lastElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.lastElementChild as HTMLElement
              modalClose.click()
            }, 500);
          }
          console.log("success")
        }else{
          console.log("error hitting backend")
        }
        console.log("finished")
      },
      args:[backendURL,jsonValue,tokenName]
    })
  }

  async function saveJSONToLocalStorage(){
    await localStorage.setItem("swagger-auth-help-JSON",JSON.stringify(inputJSON))
    await localStorage.setItem("swagger-auth-help-BackendURL",JSON.stringify(backendURL))
    await localStorage.setItem("swagger-auth-help-Token-Name",JSON.stringify(tokenName))
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-2 w-[400px] flex space-y-4 flex-col font-mono">
        <nav className="flex justify-between items-center">
          <img src="/images/icon-32.png" alt="Swagger_Auth_Help icon" />
          <p className="font-extrabold text-lg">Swagger Savior ✌️</p>
          <ModeToggle />
        </nav>

        <div className="space-y-2">
          <Label htmlFor="token">Token Name</Label>    
          <div className="flex space-x-2 items-center">
            <Input defaultValue={tokenName} placeholder="Token name in JSON" onChange={(e)=>setTokenName(e.target.value)} />
            <Button type="button" onClick={()=>{
                localStorage.removeItem("swagger-auth-help-Token-Name")
                setTokenName("")
                }} variant="destructive" size="icon">
              <Trash2 />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backendURL">Login Endpoint URL</Label>  
          <div className="flex space-x-2 items-center">
            <Input defaultValue={backendURL} onChange={(ev)=>setbackendURL(ev.target.value)}/>
            <Button  onClick={()=>{
                localStorage.removeItem("swagger-auth-help-BackendURL")
                setbackendURL("")
              }} variant="destructive" size="icon" type="button">
            <Trash2 />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="inputJSON">Input JSON</Label>  
            <Button variant="destructive" onClick={()=>{
                localStorage.removeItem("swagger-auth-help-JSON")
                setInputJSON("")
                }}>Delete JSON</Button>
          </div>
          <Textarea defaultValue={inputJSON} rows={6} onChange={(ev)=>setInputJSON(ev.target.value)}/>
        </div>

        <div className="flex items-center justify-around">
          <Button onClick={()=>saveJSONToLocalStorage()}>Save</Button>
          <Button onClick={()=>onclick(backendURL,inputJSON,tokenName)}>Login</Button>
        </div>
      </div>
    </ThemeProvider>
  )
}