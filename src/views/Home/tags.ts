import { listToMap } from '@togglecorp/fujs';

import { Tag } from './types';

export const tags: Tag[] = [
    {
        color: 'hsl(213, 100%, 85%)',
        altColor: 'hsl(213, 100%, 60%)',
        altTextColor: 'white',
        title: 'Started',
        groupName: 'Progress',
    },
    {
        color: 'hsl(250, 100%, 85%)',
        altColor: 'hsl(250, 100%, 60%)',
        altTextColor: 'white',
        title: 'Blocked',
        groupName: 'Progress',
    },
    {
        color: 'hsl(300, 100%, 85%)',
        altColor: 'hsl(300, 100%, 60%)',
        altTextColor: 'white',
        title: 'Trivial',
        groupName: 'Priority',
    },
    {
        color: 'hsl(0, 100%, 85%)',
        altColor: 'hsl(0, 100%, 60%)',
        altTextColor: 'white',
        title: 'Urgent',
        groupName: 'Priority',
    },

    {
        color: 'hsl(170, 100%, 85%)',
        altColor: 'hsl(170, 100%, 50%)',
        altTextColor: 'black',
        title: 'X',
        groupName: 'Category',
    },
    {
        color: 'hsl(105, 100%, 85%)',
        altColor: 'hsl(105, 100%, 50%)',
        altTextColor: 'black',
        title: 'Y',
        groupName: 'Category',
    },
    {
        color: 'hsl(51, 100%, 85%)',
        altColor: 'hsl(51, 100%, 50%)',
        altTextColor: 'black',
        title: 'Z',
        groupName: 'Category',
    },
];

export const tagsMapping = listToMap(
    tags,
    item => item.title,
    (item, _, i) => ({
        ...item,
        order: i,
    }),
);
