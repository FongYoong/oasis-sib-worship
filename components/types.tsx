type Person = string;

export interface SessionProps {
    date: Date,
    songs: string[],
    worship_leader: Person
    vocalist?: Person
    keyboard?: Person
    guitar?: Person
    drums?: Person
    sound_personnel?: Person
}

export interface SongProps {
    dateModified: Date,
    title: string,
    artist?: string
}

export enum PageName {
    Home = "Home",
    AllSongs = "All Songs",
    AddSession = "Add Session",
    EditSession = "Edit Session",
    About = "About",
  }