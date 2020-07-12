import { Tag } from './types';

const tags: Tag[] = [
    {
        color: 'hsl(213, 100%, 85%)',
        title: 'Started',
        groupName: 'Progress',
    },
    {
        color: 'hsl(250, 100%, 85%)',
        title: 'Blocked',
        groupName: 'Progress',
    },
    {
        color: 'hsl(300, 100%, 85%)',
        title: 'Trivial',
        groupName: 'Priority',
    },
    {
        color: 'hsl(0, 100%, 85%)',
        title: 'Urgent',
        groupName: 'Priority',
    },
];

export default tags;
