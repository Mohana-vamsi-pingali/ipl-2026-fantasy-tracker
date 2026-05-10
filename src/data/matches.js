import { rawData } from './raw.js'
import { parseRawData } from '../lib/parser.js'

export const allPlayers = [
  "Abhishek", "Pranay", "Ricky", "Bhanu", "Vamsi",
  "Sai Teja", "Prem", "Arjun", "Narsi Reddy", "Krishna"
]

export const matches = parseRawData(rawData)
