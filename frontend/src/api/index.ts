import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create a configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Instruction {
  id: string;
  instruction_id: string;
  instruction_data: number[];
}

export interface Discriminator {
  id: string;
  discriminator_id: string;
  discriminator_data: number[];
  program_id: string;
  user_id: string;
  instruction: Instruction | null;
}

export interface DiscriminatorUploadData {
  program_id: string;
  discriminator_data: number[];
  instruction_data: number[] | null;
  instruction_id?: string | null;
}

// API functions
export const uploadDiscriminator = async (data: DiscriminatorUploadData): Promise<void> => {
  await api.post(`/upload_discriminator/${data.program_id}`, data);
};

export const queryDiscriminatorsByProgramId = async (programId: string): Promise<Discriminator[]> => {
  const response = await api.get<Discriminator[]>(`/query_discriminators/${programId}`);
  return response.data;
};

export const queryInstructionsByDiscriminatorId = async (discriminatorId: string): Promise<Instruction[]> => {
  const response = await api.get<Instruction[]>(`/query_instructions/${discriminatorId}`);
  return response.data;
};

export const checkHealth = async (): Promise<string> => {
  const response = await api.get<string>('/health');
  return response.data;
};

export default api;