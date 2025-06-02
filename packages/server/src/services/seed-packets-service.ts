import { SeedPacket } from '../entities/seed-packet'
import { AppDataSource } from '../data-source'

export class SeedPacketsService {
	async getAllSeedPackets(): Promise<SeedPacket[]> {
		return await AppDataSource.manager.find(SeedPacket)
	}
}
