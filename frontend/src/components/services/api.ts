// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8080',
});

export const uploadDiscriminator = (programId: string, discriminator: string, instruction: string, userId: string) => {
  return api.post(`/upload_discriminator/${programId}`, { discriminator, instruction, user_id: userId });
};

export const queryDiscriminators = (programId: string) => {
  return api.get(`/query_discriminators/${programId}`);
};

export const queryInstructions = (discriminatorId: string) => {
  return api.get(`/query_instructions/${discriminatorId}`);
};
