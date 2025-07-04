const { getAll, create, updateEvaluation, remove} = require('../controllers/competenceController');
const Competence = require('../models/competenceModel');

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('../models/competenceModel');

describe('competenceController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all competences with global status', async () => {
      const mockData = [
        {
          toObject: () => ({
            code: 'C1',
            name: 'Test',
            subCompetences: [{ name: 'A', validated: true }]
          })
        }
      ];
      Competence.find.mockResolvedValue(mockData);
      const req = {};
      const res = mockRes();

      await getAll(req, res);

      expect(Competence.find).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled(); // no error
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          code: 'C1',
          globalStatus: 'validated'
        })
      ]);
    });
  });

  describe('create', () => {
    it('should create and return a competence', async () => {
      const req = {
        headers: {},
        body: {
          code: 'C2',
          name: 'New Competence',
          subCompetences: [
            { name: 'SC1', validated: true },
            { name: 'SC2', validated: false }
          ]
        }
      };
      const res = mockRes();

      Competence.prototype.save = jest.fn().mockResolvedValue(req.body);

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it('should return 400 if code is missing', async () => {
      const req = {
        body: {
          name: 'No Code',
          subCompetences: [{ name: 'SC', validated: true }]
        }
      };
      const res = mockRes();

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Code is required' });
    });
  });

  describe('updateEvaluation', () => {
    it('should update subCompetences and return updated object', async () => {
      const req = {
        params: { id: '123' },
        body: {
          subCompetences: [{ name: 'Updated SC', validated: true }]
        }
      };
      const res = mockRes();

      const mockDoc = {
        subCompetences: [],
        save: jest.fn().mockResolvedValue({
          _id: '123',
          ...req.body
        })
      };

      Competence.findById.mockResolvedValue(mockDoc);

      await updateEvaluation(req, res);

      expect(Competence.findById).toHaveBeenCalledWith('123');
      expect(mockDoc.save).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled(); // no error
      expect(res.json).toHaveBeenCalledWith({
        _id: '123',
        ...req.body
      });
    });

    it('should return 404 if competence not found', async () => {
      const req = {
        params: { id: 'invalid' },
        body: { subCompetences: [] }
      };
      const res = mockRes();

      Competence.findById.mockResolvedValue(null);

      await updateEvaluation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Competence not found' });
    });
  });

  describe('remove', () => {
    it('should delete a competence by ID', async () => {
      const req = { params: { id: '456' } };
      const res = mockRes();

      Competence.findByIdAndDelete.mockResolvedValue({ _id: '456' });

      await remove(req, res);

      expect(Competence.findByIdAndDelete).toHaveBeenCalledWith('456');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Competence deleted successfully'
      });
    });

    it('should return 404 if not found', async () => {
      const req = { params: { id: '404' } };
      const res = mockRes();

      Competence.findByIdAndDelete.mockResolvedValue(null);

      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Competence not found'
      });
    });
  });
});
