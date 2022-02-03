
type Person = string;

export interface SessionProps {
    id?: number,
    date: Date,
    songs: number[],
    worship_leader: Person
    vocalist?: Person
    keyboard?: Person
    guitar?: Person
    drums?: Person
    sound_personnel?: Person
}

export interface SongProps {
    id?: number,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    artist?: string
    lyrics: string
}

export enum PageName {
    Home = "Home", // All Sessions
    AllSongs = "All Songs",
    About = "About",
    ViewSong = "View Song",
    ViewSession = "View Session",
    None = "",
    Error = "Page Not Found"
}