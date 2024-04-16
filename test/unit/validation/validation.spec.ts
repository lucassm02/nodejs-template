/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { ValidationError } from 'yup';
import { randomUUID } from 'node:crypto';
import * as yup from 'yup';

import {
  address,
  cpf,
  cvv,
  email,
  number,
  numberCard,
  typePlan,
  url,
  uuid,
  zipCode
} from '@/validation';

describe('Validation yup Functions', () => {
  it('should return true when string only has numbers', () => {
    const validString = '0123456789';
    const result = number('number_field').isValidSync(validString);

    expect(result).toStrictEqual(true);
  });

  it('should return false when string has characters', async () => {
    const invalidString = '01234abcd789ASa';

    try {
      const result = await number('number_field').validate(invalidString);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('number_field precisa ser um número')
      );
    }
  });

  it('should return true when cpf is valid', () => {
    const validCpf = '85192120004';
    const result = cpf.isValidSync(validCpf);

    expect(result).toStrictEqual(true);
  });

  it('should return false when cpf is not valid', async () => {
    const invalidCpf = '85192121114';

    try {
      const result = await cpf.validate(invalidCpf);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O CPF/CNPJ informado não é válido')
      );
    }
  });

  it('should return true when cnpj is valid', () => {
    const validCpf = '33879439000195';
    const result = cpf.isValidSync(validCpf);

    expect(result).toStrictEqual(true);
  });

  it('should return false when cnpj is not valid', async () => {
    const invalidCnpj = '33879439529195';

    try {
      const result = await cpf.validate(invalidCnpj);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O CPF/CNPJ informado não é válido')
      );
    }
  });

  it('should return true when email is valid', () => {
    const validEmail = 'test@user.com';
    const result = email.isValidSync(validEmail);

    expect(result).toStrictEqual(true);
  });

  it('should return false when email is undefined', async () => {
    const undefinedEmail = undefined;

    try {
      const result = await email.validate(undefinedEmail);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O e-mail é obrigatório')
      );
    }
  });

  it('should return false when email is not valid', async () => {
    const invalidEmail = 'test.br.com';

    try {
      const result = await email.validate(invalidEmail);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('Valor inserido não corresponde a um e-mail')
      );
    }
  });

  it('should return true when url is valid', () => {
    const validUrl = 'https://domain.com.br';
    const result = url.isValidSync(validUrl);

    expect(result).toStrictEqual(true);
  });

  it('should return false when url is not valid', async () => {
    const invalidUrl = 'file://invalid_domain.com';

    try {
      const result = await url.validate(invalidUrl);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('A url está inválida'));
    }
  });

  it('should return false when url is undefined', async () => {
    const undefinedUrl = undefined;

    try {
      const result = await url.validate(undefinedUrl);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('A url é obrigatória'));
    }
  });

  it('should return true when type plan is control', () => {
    const controlType = 'control';
    const result = typePlan.isValidSync(controlType);

    expect(result).toStrictEqual(true);
  });

  it('should return true when type plan is pre', () => {
    const preType = 'pre';
    const result = typePlan.isValidSync(preType);

    expect(result).toStrictEqual(true);
  });

  it('should return false when type plan is not control or pre', async () => {
    const invalidType = 'invalid';

    try {
      const result = await typePlan.validate(invalidType);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O tipo do plano precisa ser "control" ou "pre"')
      );
    }
  });

  it('should return true when uuid is valid', () => {
    const validUuid = randomUUID();
    const result = uuid.isValidSync(validUuid);

    expect(result).toStrictEqual(true);
  });

  it('should return false when uuid is not valid', async () => {
    const invalidUuid = '1578';

    try {
      const result = await url.validate(invalidUuid);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('A url está inválida'));
    }
  });

  it('should return true when cvv is valid', () => {
    const validCvv = '123';
    const result = cvv.isValidSync(validCvv);

    expect(result).toStrictEqual(true);
  });

  it('should return false when cvv is less than 3 characters', async () => {
    const invalidCvv = '12';

    try {
      const result = await cvv.validate(invalidCvv);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O mínimo para o cvv é 3 caracteres')
      );
    }
  });

  it('should return false when cvv is more than 4 characters', async () => {
    const invalidCvv = '12345';

    try {
      const result = await cvv.validate(invalidCvv);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O limite para o cvv é 4 caracteres')
      );
    }
  });

  it('should return false when cvv is undefined', async () => {
    const undefinedCvv = undefined;

    try {
      const result = await cvv.validate(undefinedCvv);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('O cvv é obrigatório'));
    }
  });

  it('should return true when number card is valid', () => {
    const validNumberCard = 5325936707608081;
    const result = numberCard.isValidSync(validNumberCard);

    expect(result).toStrictEqual(true);
  });

  it('should return false when number card is less than 13 characters', async () => {
    const invalidNumberCard = 532508081;

    try {
      const result = await numberCard.validate(invalidNumberCard);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O mínimo para o cartão é 13 caracteres')
      );
    }
  });

  it('should return false when number card is more than 19 characters', async () => {
    const invalidCvv = 123456789101112131410;

    try {
      const result = await numberCard.validate(invalidCvv);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O limite para o cartão é 19 caracteres')
      );
    }
  });

  it('should return false when number card is undefined', async () => {
    const undefinedNumberCard = undefined;

    try {
      const result = await numberCard.validate(undefinedNumberCard);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O número do cartão é obrigatório')
      );
    }
  });

  it('should return true when zip code is valid', () => {
    const validZipCode = '76807835';
    const result = zipCode.isValidSync(validZipCode);

    expect(result).toStrictEqual(true);
  });

  it('should return false when zip code is not valid', async () => {
    const invalidZipCode = '76807-835';

    try {
      const result = await zipCode.validate(invalidZipCode);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('O cep está inválido'));
    }
  });

  it('should return false when zip code is undefined', async () => {
    const undefinedZipCode = undefined;

    try {
      const result = await zipCode.validate(undefinedZipCode);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(new ValidationError('O Cep é obrigatório'));
    }
  });

  it('should return true when address is valid', () => {
    const validAddress = {
      zip_code: '76807835',
      number: '123',
      street: 'valid_street',
      neighborhood: 'valid_neighborhood',
      city: 'valid_city',
      state: 'SP'
    };
    const result = yup.object(address).isValidSync(validAddress);

    expect(result).toStrictEqual(true);
  });

  it('should return false when address is invalid', async () => {
    const invalidAddress = {
      zip_code: null,
      number: null,
      street: null,
      neighborhood: null,
      city: null,
      state: 'S'
    };

    try {
      const result = await yup.object(address).validate(invalidAddress, {
        abortEarly: false
      });
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error.errors[0]).toStrictEqual('O Cep é obrigatório');
      expect(error.errors[1]).toStrictEqual(
        'O número da residência é obrigatório'
      );
      expect(error.errors[2]).toStrictEqual('O nome da rua é obrigatório');
      expect(error.errors[3]).toStrictEqual('O bairro é obrigatório');
      expect(error.errors[4]).toStrictEqual('A cidade é obrigatória');
      expect(error.errors[5]).toStrictEqual(
        'O estado precisa ter no mínimo 2 caracteres'
      );
    }
  });
});
