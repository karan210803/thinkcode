"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CloudUpload, Loader2Icon, WandSparkles, X } from 'lucide-react'
import Image from 'next/image'
import React, { ChangeEvent, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { storage } from '@/configs/firebaseConfig'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '@/app/provider'
import { useRouter } from 'next/navigation'
import Constants from '@/data/Constants'
  

function ImageUpload() {

    const [previewUrl, setPreviewUrl] = useState<string|null>(null)
    const [file, setFile] = useState<any>();
    const [model, setModel] = useState<string>();
    const [description, setDescription] = useState<string>();
    const {user} = useAuthContext();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const onImgSelect = (event:ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if(files) {
            console.log(files[0])
            const imgUrl = URL.createObjectURL(files[0]);
            setFile(files[0]);
            setPreviewUrl(imgUrl);
        }
    }

    const OnConvertToCodeButtonClick = async() => {
        if(!file||!model||!description) {
            console.log("Select All Fields")
            return;
        }
        setLoading(true);
        const fileName = Date.now().toString();
        const imageRef = ref(storage, "Wireframe_To_Code/"+fileName);
        await uploadBytes(imageRef, file).then(resp => {
            console.log("Image Uploaded...")
        })

        const imageUrl = await getDownloadURL(imageRef);
        console.log(imageUrl);

        const uid = uuidv4()
        const result = await axios.post ('/api/wireframe-to-code',{
            uid:uid,
            description:description,
            imageUrl:imageUrl,
            model:model,
            email:user?.email
        })
        console.log(result.data);
        setLoading(false);
        router.push('/view-code/' + uid)
    }

  return (
    <div className='mt-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {!previewUrl? <div className='p-7 border border-dashed round-md shadow-md flex flex-col items-center justify-center'>
                <CloudUpload className='h-10 w-10 text-primary'/>
                <h2 className='font-bold text-lg'>Upload Image</h2>
                <p className='text-gray-400 mt-3'>Click Button to Select Image</p>
                <div className='p-5 border border-dashed w-full flex mt-7 justify-center'>
                    <label htmlFor="imgSelect">
                        <h2 className='p-2 font-medium bg-blue-50 text-primary rounded-md px-5 cursor-pointer'>Select Image</h2>
                    </label>
                </div>
                <input type="file" 
                id='imgSelect' 
                className='hidden'
                multiple={false} 
                onChange={onImgSelect}/>
            </div>:
            <div className='p-5 border border-dashed'>
                <Image src={previewUrl} alt='preview' width={500} height={500} 
                className='w-full h-[300px] object-contain'
                />
                <X className='flex justify-end w-full cursor-pointer' onClick={() => setPreviewUrl(null)}/>
            </div>
            }
            <div className='p-6 border shadow-md rounded-lg'>
                <h2 className='font-bold text-lg'>Select AI Model</h2>
                <Select onValueChange={(value)=>setModel(value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {Constants?.AiModelList.map((model, index) => (
                            <SelectItem value={model.name} key={index}>
                                <div className='flex items-center gap-2'>
                                    <Image src={model.icon} alt={model.name} width={25} height={25}/>
                                    <h2> {model.name} </h2>
                                </div>
                                </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <h2 className='font-bold text-lg mt-7'>Enter Description about your Webpage</h2>
                <Textarea 
                onChange={(event) => setDescription(event?.target.value)}
                className='mt-3 h-[200px]' 
                placeholder='Write about your web page'/>
            </div>
        </div>
        <div className='mt-10 flex items-center justify-center'>
            <Button onClick={OnConvertToCodeButtonClick} disabled={loading}> 
                {loading?<Loader2Icon className='animate-spin'/> : <WandSparkles />}
                Convert to Code
            </Button>
        </div>
    </div>
  )
}

export default ImageUpload