import axios from 'axios';
import dotenv from 'dotenv';
import {LeadInterface} from "./interfaces/lead.interface";
import {StatusInterface} from "./interfaces/status.interface";
import {EntityInterface} from "./interfaces/entity.interface";
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
    minTime: 100, // Минимальное время между запросами в миллисекундах
    maxConcurrent: 1 // Максимальное количество одновременных запросов
});
dotenv.config();

const baseUrl = process.env.AMOCRM_BASE_URL;
const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
const headers = {
    Authorization: `Bearer ${accessToken}`,
};
export const getLeads = async (query?: string) => {
    const leadsUrl = `${baseUrl}/api/v4/leads`;
    if (query){
        const url = leadsUrl+'?'+query
        console.log(url)
        const res  = await axios.get(url,{ headers })
        return res.data._embedded.leads
    }


    const leadsResponse = await axios.get(leadsUrl, { headers });
    const leads:LeadInterface[] = leadsResponse.data._embedded.leads;



    const fetchData = async (lead: LeadInterface): Promise<any> => {
        try {
            const statusUrl = `${baseUrl}/api/v4/leads/pipelines/${lead.pipeline_id}/statuses/${lead.status_id}`
            const statusesResponse = await axios.get(statusUrl,{ headers})
            const status: StatusInterface=    statusesResponse.data
            const usersUrl = `${baseUrl}/api/v4/users/${lead.responsible_user_id}`
            const usersResponse = await limiter.schedule(() => axios.get(usersUrl, { headers }));
            const responsibleUser = usersResponse.data
            const linksUrl = `${baseUrl}/api/v4/leads/${lead.id}/links`;
            const linksResponse = await limiter.schedule(() => axios.get(linksUrl, { headers }));
            const links: EntityInterface[] = linksResponse.data._embedded.links;
            const contactsEntity = links.find(link => link.to_entity_type === 'contacts');

            if (!contactsEntity) {
                return {
                    ...lead,
                    status_name:status.name,
                    responsible_user_name:responsibleUser.name,
                    contact: 'Без Контакта'

                };
            }

            const contactUrl = `${baseUrl}/api/v4/contacts/${contactsEntity.to_entity_id}`;
            const contactResponse = await limiter.schedule(() => axios.get(contactUrl, { headers }));
            const contact = contactResponse ? contactResponse.data : 'Без Контакта';

            return {
                ...lead,
                status_name:status.name,
                contact_name: contact.name,
                responsible_user_name:responsibleUser.name
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return {
                ...lead,
                status_name:'Ошибка получения данных',
                contact_name: 'Ошибка получения данных',
                responsible_user_name:'Ошибка получения данных'
            };
        }
    };

    const getContact = async (leads: LeadInterface[]): Promise<any[]> => {
        const promises = leads.map(lead => fetchData(lead));
        return Promise.all(promises);
    };

    const leadsData:LeadInterface[] = await getContact(leads)
    return leadsData





};
