// src/controllers/mission.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Mission from '../models/Mission';

export const createMission = async (req: AuthRequest, res: Response) => {
  try {
    const { title, isPublic, introduction, mainContent, examples, conclusion, assignedTo } = req.body;
    
    const mission = new Mission({
      title,
      isPublic,
      introduction,
      mainContent,
      examples,
      conclusion,
      assignedTo,
      createdBy: req.userId
    });

    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Error creating mission' });
  }
};

export const getMissions = async (req: AuthRequest, res: Response) => {
  try {
    const { team } = req.query;
    
    let query = {};
    if (team) {
      query = {
        $or: [
          { isPublic: true },
          { assignedTo: team }
        ]
      };
    }

    const missions = await Mission.find(query).sort({ createdAt: -1 });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching missions' });
  }
};

export const getMissionById = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mission' });
  }
};

export const updateMission = async (req: AuthRequest, res: Response) => {
  try {
    const mission = await Mission.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true }
    );

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found or unauthorized' });
    }
    
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Error updating mission' });
  }
};

export const deleteMission = async (req: AuthRequest, res: Response) => {
  try {
    const mission = await Mission.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found or unauthorized' });
    }

    res.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting mission' });
  }
};