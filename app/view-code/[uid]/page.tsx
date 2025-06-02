"use client"
import AppHeader from '@/app/_components/AppHeader'
import Constants from '@/data/Constants'
import axios from 'axios'
import { Loader2, LoaderCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import SelectionDetails from '../_components/SelectionDetails'
import CodeEditor from '../_components/CodeEditor'

export interface RECORD {
  id: number,
  description: string,
  code: any,
  imageUrl: string,
  model: string,
  createdBy: string
}

function ViewCode() {

  const {uid}=useParams();
  const [loading, setLoading]=useState(false);
  const [codeResp, setCodeResp]=useState('');
  const [record, setRecord]=useState<RECORD>();
  const [isReady, setIsReady]=useState(false);
  useEffect(()=>{
    uid&&GetRecordInfo();
  },[uid])

  const GetRecordInfo=async()=>{
    setIsReady(false)
    setCodeResp('')
    setLoading(true)
    const result = await axios.get('/api/wireframe-to-code?uid='+uid)
    console.log(result.data);
    const resp=result?.data;
    setRecord(result?.data)
    if(resp?.code==null)
    {
      GenerateCode(resp);
    }
    if(resp?.error)
    {
      console.log("No Record Found")
    }
    
    //setLoading(false)
  }

  const GenerateCode=async(record:RECORD)=>{
    setLoading(true)
      const res=await fetch('/api/ai-model',{
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          description:record?.description+":"+Constants.PROMPT,
          model:record.model,
          imageUrl:record?.imageUrl
        })

      })

      if(!res.body) return ;
      setLoading(false)
      const reader=res.body.getReader();
      const decoder=new TextDecoder();
      while(true)
      {
        const {done,value}=await reader.read();
        if(done) break;

        const text=(decoder.decode(value)).replace('```jsx','').replace('```typescript','').replace('```','').replace('jsx','');
        setCodeResp((prev)=>prev+text);
        console.log(text);
      }

      setIsReady(true)
      
  }

  return (
    <div>
      <AppHeader hideSidebar={true}/>
      <div className='grid grid-cols-1 md:grid-cols-5 p-5 gap-10'>
          <div>
              {/* Selection Details */}
              <SelectionDetails record={record} regenerateCode={() => GetRecordInfo()}
                isReady={isReady}
                />
          </div>
          <div className='col-span-4'>
              {/* Code Editor */}
              {loading ? <div>
                <h2 className='font-bold text-2xl text-center p-20 flex items-center justify-center bg-slate-100 h-[80vh] rounded-xl'> <Loader2 className='animate-spin'/> Analyzing the Wireframe.</h2>
              </div>: 
                <CodeEditor codeResp={codeResp} isReady={isReady} regenerateCode={() => GetRecordInfo()}/>
              }
              
          </div>
      </div>
     
      
    </div>
  )
}

export default ViewCode