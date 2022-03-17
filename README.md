# Oasis SIB Worship

### 🎵 [View the website here.](http://oasis-sib-worship.vercel.app/)

This website is intended for:
🎵 Worship team to add songs to a centralized database which serves as a reference.
📝 Worship leaders to specify the order of songs and also additional info for each worship session which can be viewed by everyone.
💻 Media streamers to export these songs into coherent Powerpoint lyrics automatically with minimal effort.

***

## Development Tools
* Hosting providers:
    * **[Vercel](https://vercel.com/)** is used to host the website.
    * **[PlanetScale](https://planetscale.com/)** is a MySQL database platform used to manage the website's data. [Vercel provides an integration plugin.](https://vercel.com/integrations/planetscale)
* Stack:
    * **[Next.js](https://nextjs.org/)**
    * **[TypeScript](https://www.typescriptlang.org/)**
    * **[Prisma](https://www.prisma.io/)** for Typescript-based ORM ([More info on Prisma and PlanetScale](https://www.prisma.io/planetscale))

***

## Screenshots

<details>
<summary>Home</summary>

![Home](https://i.imgur.com/AQigwrR.png)

</details>

<details>
<summary>All Songs</summary>

![All_Songs](https://i.imgur.com/KRQ9yzJ.png)

</details>

<details>
<summary>Adding Songs</summary>

![Add_Song](https://i.imgur.com/VLhNUx8.png)

</details>

<details>
<summary>Adding Sessions</summary>

![Add_Session1](https://i.imgur.com/DRkG9jB.png)
![Add_Session2](https://i.imgur.com/crRNyYu.png)

</details>

<details>
<summary>Exporting</summary>

![Export1](https://i.imgur.com/Z3VecMp.png)
![Export2](https://i.imgur.com/R9S4Xud.png)

</details>


***

## Development

* `npm run dev` to run the Next.js server in development.

* Make sure to set the environment variable `ADMIN_PASSWORD` in both the local environment (`env.local` file) and also Vercel or whatever hosting provider used.

***

