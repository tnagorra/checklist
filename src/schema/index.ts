import Dict, { basicTypes, Schema } from '@togglecorp/ravl';
import { isProduction } from '#config/env';

const userDefinedSchemas: Schema[] = [
    {
        doc: {
            name: 'dbentity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            createdOn: { type: 'string', required: true }, // date
            modifiedOn: { type: 'string' }, // date
        },
    },
];

const warning = !isProduction;
const dict = new Dict({ warning });

[
    ...basicTypes,
    ...userDefinedSchemas,
].forEach(schema => dict.put(schema.doc.name, schema));

export default dict;
