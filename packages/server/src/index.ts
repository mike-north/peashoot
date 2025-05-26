import { Plant } from "./entities/plant";
import { AppDataSource } from "./data-source";
import * as rimraf from "rimraf";

export function helloWorld() {
  return "Hello World";
}

async function main() {
  rimraf.sync("peashoot.sqlite");
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Plant);
  const plant = repo.create({
    name: "Plant 1",
  });
  await repo.save(plant);
  console.log("Plant saved", plant, plant.id);
}

console.log("hiooo", helloWorld());
main().catch(console.error);
