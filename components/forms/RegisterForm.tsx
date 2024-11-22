"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl } from "@/components/ui/form"
import { CustomFormField } from "../CustomFormField"
import { SubmitButton } from "../SubmitButton"
import { useState } from "react"
import { PatientFormValidation } from "@/lib/form-validation"
import { useRouter } from "next/navigation"
import { FormFieldType } from "./PatientForm"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants"
import { Label } from "../ui/label"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import { FileUploader } from "../FileUploader"
import { registerPatient } from "@/lib/actions/patient.actions"


const RegisterForm = ({ user }: { user: User }) => {

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
    },
  })
    
  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {

    setIsLoading(true);

    let formData;

    if ( values.identificationDocument && values.identificationDocument?.length > 0 ) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });

      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", values.identificationDocument[0].name);
    }

    try {
      const patientData = {
        ...values,
        userId: user.$id,
        birthDate: new Date(values.birthDate),
        identificationDocument: formData,
      }

      
      // @ts-ignore
      const patient = await registerPatient(patientData)

      if (patient) router.push(`/patients/${user.$id}/new-appointment`)
      
    } catch (error: any) {

      console.log(error);

    }

    setIsLoading(false);

  }
    
  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
            <section className="space-y-4">
                <h1 className="header">Welcome 👋</h1>
                <p className="text-dark-700">Let us know more about yourself.</p>
              </section>

              <section className="space-y-6">
                  <div className="mb-9 space-y-1">
                    <p className="sub-header">Personal Information</p>
                  </div>
              </section>

              {/* Name */}
              <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="name" label="Full name" placeholder="John Doe" iconSrc="/assets/icons/user.svg" iconAlt="User" />
              
              {/* Email & Phone */}
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="email" label="Email address" placeholder="example@email.com" iconSrc="/assets/icons/email.svg" iconAlt="email" />
                <CustomFormField control={form.control} fieldType={FormFieldType.PHONE_INPUT} name="phone" label="Phone Number" placeholder="79945 56678" />
              </div>
              
              {/* Birth Date & Gender */}
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField control={form.control} fieldType={FormFieldType.DATE_PICKER} name="birthDate" label="Date of birth" />
                <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SKELETON}
                    name="gender" label="Gender"
                    renderSkeleton={(field) => (
                      <FormControl>
                          <RadioGroup
                            className="flex h-11 gap-6 xl:justify-between"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            >
                            {GenderOptions.map((option, i) => (
                              <div key={option + i} className="radio-group justify-center">
                                <RadioGroupItem value={option} id={option} />
                                <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                  )} />
              </div>

              {/* Adress & Occupation */}
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="address" label="Address" placeholder="14th street, Mubai - Maharastra"  />
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="occupation" label="Occupation" placeholder="Software Engineer"  />
              </div>
        
              {/* Email & Phone */}
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="emergencyContactName" label="Emergency contact name" placeholder="Guardian's name" />
                <CustomFormField control={form.control} fieldType={FormFieldType.PHONE_INPUT} name="emergencyContactNumber" label="Emergency contact number" placeholder="+91 79945 56678" />
              </div>
              
              <section className="space-y-6">
                  <div className="mb-9 space-y-1">
                    <p className="sub-header">Medical Information</p>
                  </div>
              </section>
              
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField control={form.control} fieldType={FormFieldType.SELECT} name="primaryPhysician" label="Primary Physician" placeholder="Select a physician" >
                  {Doctors.map((doctor) => (
                    <SelectItem key={doctor.name} value={doctor.name} >
                      <div className="flex cursor-pointer items-center gap-2">
                        <Image src={doctor.image} height={32} width={32} alt={doctor.name} className="rounded-full border border-dark-500"/>
                        <p>{doctor.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
              
              <div className="flex flex-col gap-6 xl:flex-row"> 
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="insuranceProvider" label="Insurance provider" placeholder="BlueCross BlueShield" />
                <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="insurancePolicyNumber" label="Insurance policy number" placeholder="ABC12456789" />
              </div>
              
              <div className="flex flex-col gap-6 xl:flex-row"> 
                <CustomFormField control={form.control} fieldType={FormFieldType.TEXTAREA} name="allergies" label="Allergies (if any)" placeholder="Peanuts, Penicillin, Pollen" />
                <CustomFormField control={form.control} fieldType={FormFieldType.TEXTAREA} name="currentMedications" label="Current medications (if any)" placeholder="Ibuprofen 200mg, Paracetamol 500mg" />
              </div>
              
              <div className="flex flex-col gap-6 xl:flex-row"> 
                <CustomFormField control={form.control} fieldType={FormFieldType.TEXTAREA} name="familyMedicalHistory" label="Family medical history" placeholder="Father had heart disease, Mother had diabetes" />
                <CustomFormField control={form.control} fieldType={FormFieldType.TEXTAREA} name="pastMedicalHistory" label="Past medical history" placeholder="Appendectomy, Tonsilliectomy" />
              </div>
              
              <section className="space-y-6">
                  <div className="mb-9 space-y-1">
                    <p className="sub-header">Identification and Verification</p>
                  </div>
              </section>
              
              <CustomFormField control={form.control} fieldType={FormFieldType.SELECT} name="identificationType" label="Identification type" placeholder="Select a identification type" >
                  {IdentificationTypes.map((type) => (
                    <SelectItem key={type} value={type} >
                      {type}
                    </SelectItem>
                  ))}
              </CustomFormField>
              
              <CustomFormField control={form.control} fieldType={FormFieldType.INPUT} name="identificationNumber" label="Identification number" placeholder="1234569786" />
              
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SKELETON}
                name="identificationDocument" 
                label="Scanned copy of identification document"
                renderSkeleton={(field) => (
                  <FormControl>
                      <FileUploader files={field.value} onChange={field.onChange}/>
                  </FormControl>
              )} />
              
              <section className="space-y-6">
                  <div className="mb-9 space-y-1">
                    <p className="sub-header">Consent and Privacy</p>
                  </div>
                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name="treatmentConsent"
                    label="I consent to receive treatment for my health condition."
                  />

                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name="disclosureConsent"
                    label="I consent to the use and disclosure of my health
                    information for treatment purposes."
                  />

                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name="privacyConsent"
                    label="I acknowledge that I have reviewed and agree to the
                    privacy policy"
                  />
              </section>
              
              <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </form>
  </Form>
  )
}

export default RegisterForm