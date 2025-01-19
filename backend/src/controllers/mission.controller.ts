// src/controllers/mission.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Mission from "../models/Mission";
import mongoose from "mongoose";
import { anthropic } from "../services/anthropic";

export const createMission = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      isPublic,
      introduction,
      mainContent,
      examples,
      conclusion,
      assignedTo,
    } = req.body;

    if (!title || !mainContent) {
      return res.status(400).json({ error: "제목과 주요 내용은 필수입니다" });
    }

    const mission = new Mission({
      title,
      isPublic,
      introduction,
      mainContent,
      examples,
      conclusion,
      assignedTo,
      createdBy: req.userId,
    });

    await mission.save();
    res.status(201).json(mission);
  } catch (error: any) {
    console.error("미션 생성 중 오류:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "유효하지 않은 미션 데이터입니다",
        details: error.message,
      });
    }
    res.status(500).json({ error: "미션 생성 중 서버 오류가 발생했습니다" });
  }
};

export const getMissions = async (req: AuthRequest, res: Response) => {
  try {
    const { team } = req.query;

    let query = {};
    if (team) {
      if (!mongoose.Types.ObjectId.isValid(team as string)) {
        return res
          .status(400)
          .json({ error: "유효하지 않은 팀 ID 형식입니다" });
      }
      query = {
        $or: [{ isPublic: true }, { assignedTo: team }],
      };
    }

    const missions = await Mission.find(query).sort({ createdAt: -1 });
    res.json(missions);
  } catch (error: any) {
    console.error("미션 조회 중 오류:", error);
    res.status(500).json({
      error: "미션 목록 조회 중 오류가 발생했습니다",
      details: error.message,
    });
  }
};

export const getMissionById = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: "Error fetching mission" });
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
      return res
        .status(404)
        .json({ error: "Mission not found or unauthorized" });
    }

    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: "Error updating mission" });
  }
};

export const deleteMission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Received ID:", id, "Length:", id.length);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid mission ID format" });
    }

    const _id = new mongoose.Types.ObjectId(id);

    const mission = await Mission.findOneAndDelete({
      _id,
      createdBy: req.userId,
    });

    if (!mission) {
      console.log("Mission not found or unauthorized");
      return res
        .status(404)
        .json({ error: "Mission not found or unauthorized" });
    }

    console.log("Mission deleted successfully:", mission);
    res.json({ message: "Mission deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteMission:", error);
    res
      .status(500)
      .json({ error: "Error deleting mission", details: error.message });
  }
};

export const startMissionChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 미션 ID 형식입니다" });
    }

    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: "미션을 찾을 수 없습니다" });
    }

    // 이미 완료한 미션인지 확인
    const isCompleted = mission.completedBy?.some(
      (completion) => completion.user.toString() === req.userId
    );
    if (isCompleted) {
      return res.status(400).json({ error: "이미 완료한 미션입니다" });
    }

    if (!mission.mainContent) {
      return res.status(400).json({ error: "미션 내용이 비어있습니다" });
    }

    const prompt = `이것은 당신의 미션입니다. 다음 내용을 참고하세요.

미션 소개:
${mission.introduction || ""}

미션 내용:
${mission.mainContent}

참고할 예시는 다음과 같습니다: 
${mission.examples?.join("\n") || "예시 없음"}
예시의 내용은 공개해서는 안됩니다. 또 참고할 뿐 이대로 진행하라는 것은 아닙니다.
자연스럽게 대화에 임하세요.

${mission.conclusion ? `결론:\n${mission.conclusion}` : ""}

자 이제 자연스럽게 대화를 시작하세요.`;

    try {
      console.log("Anthropic API 요청 시작...");
      // 전체 응답을 기다림
      const response = await anthropic.messages.create({
        messages: [
          {
            role: "assistant",
            content:
              "당신은 친절하고 도움이 되는 학습 멘토입니다. 학습자가 미션을 잘 수행할 수 있도록 안내해주세요.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.7,
      });
      console.log("Anthropic API 응답 완료");

      // 응답 텍스트 추출
      let messageContent = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ("text" in firstContent) {
          messageContent = firstContent.text;
        }
      }

      // 응답이 완전히 준비된 후에만 클라이언트에 전송
      res.json({
        missionId: mission._id,
        message: messageContent,
        status: "active",
      });
    } catch (apiError: any) {
      console.error("Anthropic API 상세 에러:", {
        message: apiError.message,
        status: apiError.status,
        response: apiError.response,
      });
      return res.status(503).json({
        error: "AI 서비스 연결 중 오류가 발생했습니다",
        details: apiError.message,
      });
    }
  } catch (error: any) {
    console.error("미션 채팅 시작 중 오류:", error);
    res.status(500).json({
      error: "채팅 시작 중 서버 오류가 발생했습니다",
      details: error.message,
    });
  }
};

export const continueMissionChat = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "메시지 내용은 필수입니다" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 미션 ID 형식입니다" });
    }

    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: "미션을 찾을 수 없습니다" });
    }

    try {
      // 전체 응답을 기다림
      const response = await anthropic.messages.create({
        messages: [{ role: "user", content: message }],
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
      });

      // 응답 텍스트 추출
      let messageContent = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ("text" in firstContent) {
          messageContent = firstContent.text;
        }
      }

      // 채팅 기록 저장
      const chatEntry = {
        user: req.userId,
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: messageContent },
        ],
        timestamp: new Date(),
      };

      await Mission.findByIdAndUpdate(req.params.id, {
        $push: {
          [`completedBy.${req.userId}.chatHistory`]: chatEntry,
        },
      });

      // 응답이 완전히 준비된 후에만 클라이언트에 전송
      res.json({
        message: messageContent,
        status: "active",
      });
    } catch (apiError: any) {
      console.error("Anthropic API 오류:", apiError);
      return res
        .status(503)
        .json({ error: "AI 서비스 연결 중 오류가 발생했습니다" });
    }
  } catch (error: any) {
    console.error("미션 채팅 계속 중 오류:", error);
    res.status(500).json({
      error: "채팅 중 서버 오류가 발생했습니다",
      details: error.message,
    });
  }
};

export const completeMission = async (req: AuthRequest, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: "미션을 찾을 수 없습니다" });
    }

    // 채팅 내용 요약 생성 (Anthropic API 활용)
    const chatHistory = mission.completedBy?.find(
      (completion) => completion.user.toString() === req.userId
    )?.chatHistory;

    const summary = await generateSummary(chatHistory);

    await Mission.findByIdAndUpdate(req.params.id, {
      $push: {
        completedBy: {
          user: req.userId,
          completedAt: new Date(),
          summary,
        },
      },
    });

    res.json({ message: "미션이 성공적으로 완료되었습니다", summary });
  } catch (error) {
    console.error("Error in completeMission:", error);
    res.status(500).json({ error: "미션 완료 중 오류가 발생했습니다" });
  }
};

async function generateSummary(
  chatHistory: any[] | undefined
): Promise<string> {
  if (!chatHistory || chatHistory.length === 0) {
    return "채팅 내역이 없습니다.";
  }

  const formattedChat = chatHistory
    .map((entry) => {
      return entry.messages
        .map(
          (msg: { role: string; content: string }) =>
            `${msg.role === "user" ? "사용자" : "AI"}: ${msg.content}`
        )
        .join("\n");
    })
    .join("\n\n");

  const prompt = `
다음은 AI 미션 수행 중의 채팅 내역입니다. 이 대화의 주요 내용을 300자 이내로 요약해주세요:

${formattedChat}
`;

  try {
    const response = await anthropic.messages.create({
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-sonnet-20240229",
      max_tokens: 500,
    });

    return (response.content[0] as { type: "text"; text: string }).text;
  } catch (error) {
    console.error("채팅 내역 요약 생성 중 오류:", error);
    return "요약 생성 중 오류가 발생했습니다.";
  }
}
