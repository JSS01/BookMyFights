import db from './db.js'


const fighters = [
  // UFC

  { name: "Dricus Du plessis", type: "ufc" },
  { name: "Alexander Volkanovski", type: "ufc" },
  { name: "Alex Pereira", type: "ufc" },
  { name: "Max Holloway", type: "ufc" },
  { name: "Charles Oliveira", type: "ufc" },
  { name: "Ilia Topuria", type: "ufc" },
  { name: "Robert Whittaker", type: "ufc" },
  { name: "Kamaru Usman", type: "ufc" },
  { name: "Joaquin Buckley", type: "ufc" },
  { name: "Khamzat Chimaev", type: "ufc" },


  // Boxing
  { name: "Oleksandr Usyk", type: "boxing" },
  { name: "Junto Nakatani", type: "boxing" },
  { name: "Shakur Stevenson", type: "boxing" },





  

];

const addFighters = async () => {
  try {

    for (const fighter of fighters) {
      await db.execute(
        `INSERT INTO fighters (name, type) VALUES (?, ?);`,
        [fighter.name, fighter.type]
      );
    }
    console.log("Fighters seeded successfully.");
    await db.end();
  } catch (err) {
    console.error("Error seeding fighters:", err);
  }
};

export default addFighters;
