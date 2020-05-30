export interface Tag {
    color: string;
    altColor: string;
    altTextColor: string;
    title: string;
    groupName: string;
}

export interface ChecklistItem {
    key: string;
    value: string;
    tags?: string[];
    archived?: boolean;
}
