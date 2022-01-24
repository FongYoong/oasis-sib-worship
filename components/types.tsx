type Person = string | undefined;

export interface SessionProps {
    date: Date,
    songs: string[],
    worship_leader: Person
    vocalist: Person
    keyboard: Person
    guitar: Person
    drums: Person
    sound_personnel: Person
}