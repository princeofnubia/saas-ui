import React, { useMemo } from 'react'
import { forwardRef } from '@chakra-ui/react'
import {
  ArrayField,
  DisplayIf,
  FieldProps,
  FieldValues,
  FieldsProvider,
  Form,
  GetFieldResolver,
  ObjectField,
} from './'
import { Field } from './field'
import { FormStep, StepsOptions } from './step-form'
import {
  StepFormProvider,
  UseStepFormProps,
  useStepForm,
} from './use-step-form'
import { StepperProvider } from '@saas-ui/core'
import { runIfFn } from '@chakra-ui/utils'
import { GetResolver } from './form'

type StepFormType<FieldDefs, ExtraProps = object, ExtraOverrides = object> = (<
  TSteps extends StepsOptions<any> = StepsOptions<any>,
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
  TFieldTypes = FieldProps<TFieldValues>
>(
  props: UseStepFormProps<TSteps, TFieldValues, TContext, TFieldTypes> & {
    ref?: React.ForwardedRef<HTMLFormElement>
  }
) => React.ReactElement) & {
  displayName?: string
  id?: string
}

export type DefaultFormType<
  FieldDefs = any,
  ExtraProps = object,
  ExtraOverrides = object
> = (<
  TFieldValues extends Record<string, any> = any,
  TContext extends object = object,
  TSchema = unknown
>(
  props: any
) => React.ReactElement) & {
  displayName?: string
  id?: string
}

export interface CreateFormProps<FieldDefs> {
  resolver?: GetResolver
  fieldResolver?: GetFieldResolver
  fields?: FieldDefs extends Record<string, React.FC<any>> ? FieldDefs : never
}

export function createStepForm<
  FieldDefs = any,
  ExtraProps = object,
  ExtraOverrides = object
>({ fields, resolver, fieldResolver }: CreateFormProps<FieldDefs> = {}) {
  const StepForm = forwardRef<any, 'div'>((props, ref) => {
    const { children, steps, ...rest } = props

    const stepper = useStepForm({
      resolver,
      fieldResolver,
      ...props,
    })

    const { getFormProps, ...ctx } = stepper

    const context = useMemo(() => ctx, [ctx])

    return (
      <StepperProvider value={context}>
        <StepFormProvider value={context}>
          <FieldsProvider value={fields || {}}>
            <Form ref={ref} {...rest} {...getFormProps()}>
              {runIfFn(children, {
                ...stepper,
                Field: Field as any,
                FormStep: FormStep as any,
                DisplayIf: DisplayIf as any,
                ArrayField: ArrayField as any,
                ObjectField: ObjectField as any,
              })}
            </Form>
          </FieldsProvider>
        </StepFormProvider>
      </StepperProvider>
    )
  }) as StepFormType<FieldDefs, ExtraProps, ExtraOverrides>

  StepForm.displayName = `Step${Form.displayName || Form.name}`

  return StepForm
}
