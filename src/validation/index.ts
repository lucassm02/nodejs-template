import { cnpj as validCnpj, cpf as validCpf } from 'cpf-cnpj-validator';
import * as yup from 'yup';

export const string = yup.string().nullable(true);

export const number = (field: string) =>
  yup.string().matches(/[0-9]/, `${field} precisa ser um número`);

export const cpf = yup
  .mixed()
  .nullable(true)
  .test('is-cpf-or-cnpj', 'O CPF/CNPJ informado não é válido', (value) => {
    if (value?.length <= '11') {
      return validCpf.isValid(value);
    }

    return validCnpj.isValid(value);
  });

export const phone = yup
  .string()
  .matches(/^(55\d{11})$|^(55\d{10})$/, 'O telefone está fora dos padrões')
  .nullable(true)
  .required('O telefone é obrigatório');

export const email = yup
  .string()
  .trim()
  .matches(
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
    'Valor inserido não corresponde a um e-mail'
  )
  .nullable(true)
  .required('O e-mail é obrigatório');

export const url = yup
  .string()
  .matches(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\\.-]+)+[\w\-\\._~:\\/?#[\]@!\\$&'\\(\\)\\*\\+,;=.]+$/,
    'A url está inválida'
  )
  .nullable(true)
  .required('A url é obrigatória');

export const typePlan = yup
  .string()
  .matches(/^control$|^pre$/, 'O tipo do plano precisa ser "control" ou "pre"');

export const uuid = yup.string().uuid('O id não é válido');

export const cvv = number('O cvv')
  .min(3, 'O mínimo para o cvv é 3 caracteres')
  .max(4, 'O limite para o cvv é 4 caracteres')
  .nullable(true)
  .required('O cvv é obrigatório');

export const numberCard = number('O número do cartão')
  .min(13, 'O mínimo para o cartão é 13 caracteres')
  .max(19, 'O limite para o cartão é 19 caracteres')
  .required('O ddd é obrigatório');

export const zipCode = yup
  .string()
  .matches(/^(\d{8})$/, 'O cep está inválido')
  .nullable(true)
  .required('O Cep é obrigatório');

export const address = {
  zip_code: zipCode,
  number: yup
    .string()
    .nullable(true)
    .required('O número da residência é obrigatório'),
  street: string.required('O nome da rua é obrigatório'),
  neighborhood: string.required('O bairro é obrigatório'),
  city: string.required('A cidade é obrigatória'),
  state: string
    .min(2, 'O estado precisa ter no mínimo 2 caracteres')
    .required('O estado é obrigatório'),
};
