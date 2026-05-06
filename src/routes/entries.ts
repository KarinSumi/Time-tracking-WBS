import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

router.post('/', async (req, res) => {
  const { hours, taskDescription, userId, date } = req.body;
  
  try {
    const entry = await prisma.timeEntry.create({
      data: {
        hours,
        taskDescription,
        userId,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.get('/', async (req, res) => {
  try {
    const entries = await prisma.timeEntry.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

export default router;
