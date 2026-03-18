import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
