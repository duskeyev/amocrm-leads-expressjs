import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.AMOCRM_BASE_URL;
const accessToken = process.env.AMOCRM_ACCESS_TOKEN;

export const getLeads = async (query?: string) => {
    const leadsUrl = `${baseUrl}/api/v4/leads`;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    const params = query ? { query } : {};
    const leadsResponse = await axios.get(leadsUrl, { headers, params });
    const leads = leadsResponse.data._embedded.leads;
    const pipelineId = leads[0].pipeline_id

    const statusUrl =`${baseUrl}/api/v4/leads/pipelines/${pipelineId}/statuses`
    const statusesResponse = await axios.get(statusUrl,{ headers})
    const statuses =    statusesResponse.data._embedded.statuses

    return leads.map((lead:any) => {

        const status = statuses.find((status:any) => status.id === lead.status_id);


        return {
            ...lead,
            status_name: status ? status.name : 'Неизвестный статус',
        };
    });
    const contactsUrl = baseUrl+
    leads.map(lead:any)=>{
        async (const responsibleName = await axios.get()
        return {
            ..lead,
            responsibleName:
        }
    }

};
