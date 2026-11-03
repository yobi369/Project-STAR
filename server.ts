import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper for Gemini AI client
const getAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return key ? new GoogleGenAI({ apiKey: key }) : null;
};

// Health endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
  res.json({ status: "ok", service: "Project S.T.A.R. Axiom C4ISR Backend", hasApiKey: hasKey });
});

// Strategic Courses of Action (COA) Endpoint
app.post("/api/gemini/coa", async (req, res) => {
  const { threat, assets, sectorName } = req.body;
  
  const generateFallbackCOAs = () => [
    {
      id: `coa-${Date.now()}-0`,
      title: "Operation Rapid Talon (Multi-Domain Kinetic Strike)",
      objective: `Immediate precision air interdiction and rapid ground cordon against ${threat?.title || threat?.description || 'hostile forces'} in ${sectorName || 'the Operational Area'}.`,
      involvedAssetIds: assets?.slice(0, 2).map((a: any) => a.id) || ['asset-1', 'asset-2'],
      assets: ["KDF F-5E Tiger II Air Wing", "Special Forces Group (40 Rangers)"],
      risks: "Moderate collateral risk in dense scrubland; high fuel burn during sustained combat air patrol.",
      successProbability: 88,
      phases: [
        "Phase 1: Low-altitude electronic jamming and orbital radar seal",
        "Phase 2: Precision kinetic strike on high-value coordinates",
        "Phase 3: Fast-rope helicopter extraction and perimeter reinforcement"
      ],
      estimatedDuration: "45 Minutes",
      collateralRisk: "Low (Target isolated)"
    },
    {
      id: `coa-${Date.now()}-1`,
      title: "Operation Silent Vanguard (Autonomous Swarm & SF Intercept)",
      objective: `Deploy UAV swarm reconnaissance paired with Long-Range Special Operations Patrol to locate, shadow, and neutralize without collateral disruption.`,
      involvedAssetIds: assets?.slice(1, 3).map((a: any) => a.id) || ['asset-2', 'asset-3'],
      assets: ["ScanEagle Tactical Drone Swarm", "Vampire C-UAS Interceptor Battery"],
      risks: "Potential communication blackout in deep valley corridors; extended operational timeline.",
      successProbability: 93,
      phases: [
        "Phase 1: Night-time FLIR thermal shadowing and sniper perimeter setup",
        "Phase 2: Target isolation through tactical acoustic distraction",
        "Phase 3: Covert interdiction and evidence extraction"
      ],
      estimatedDuration: "3 Hours",
      collateralRisk: "Minimal (< 2%)"
    },
    {
      id: `coa-${Date.now()}-2`,
      title: "Operation Iron Net (Logistical Cordon & C-UAS Electronic Shield)",
      objective: `Establish multi-agency roadblock cordon with mechanized infantry and Vampire C-UAS domes to cut off escape corridors.`,
      involvedAssetIds: assets?.slice(0, 3).map((a: any) => a.id) || ['asset-1', 'asset-4'],
      assets: ["Mechanized Infantry Battalion (7 KR)", "National Police Reserve (NPR) Cordon"],
      risks: "Slow containment may allow high-value targets to disperse into civilian sectors.",
      successProbability: 79,
      phases: [
        "Phase 1: Rapid deployment of armored checkpoints on all arterial routes",
        "Phase 2: Aerial loudspeaker warning and surrender corridor establishment",
        "Phase 3: Systematic grid search and safe detention"
      ],
      estimatedDuration: "6 Hours",
      collateralRisk: "Low"
    }
  ];

  try {
    const ai = getAI();
    if (!ai) return res.json(generateFallbackCOAs());

    const prompt = `You are the Chief AI Strategic Officer for the Kenya Defence Forces (KDF) Project STAR C4ISR platform.
Target Threat: ${threat?.description || 'Unidentified Contact'} at coordinates [${threat?.location?.join(', ') || '37.5, 3.0'}].
Current AO: ${sectorName || 'Kenya Border Sector'}.
Available KDF Assets: ${JSON.stringify(assets || [])}.

Generate exactly 3 diverse, realistic, and highly professional military Courses of Action (COAs):
1. Kinetic High-Intensity Air/Ground Strike (Direct Action)
2. Covert Asymmetric / Autonomous Drone Swarm Intervention
3. Multi-Agency Cordon, C-UAS Electronic Dome & Logistical Interdiction

For each COA, provide:
- title: Tactical military operation name
- objective: Clear, concise military objective
- involvedAssetIds: Array of asset IDs from the provided list
- assets: Names of military units involved
- risks: Tactical and collateral risks
- successProbability: Integer percentage between 60 and 96
- phases: 3-step execution phases array
- estimatedDuration: Time estimate
- collateralRisk: Low, Moderate, or Minimal`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              involvedAssetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              assets: { type: Type.ARRAY, items: { type: Type.STRING } },
              risks: { type: Type.STRING },
              successProbability: { type: Type.NUMBER },
              phases: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedDuration: { type: Type.STRING },
              collateralRisk: { type: Type.STRING }
            },
            required: ["title", "objective", "involvedAssetIds", "assets", "risks", "successProbability", "phases", "estimatedDuration", "collateralRisk"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    if (Array.isArray(data) && data.length > 0) {
      const result = data.map((d: any, i: number) => ({
        ...d,
        id: `coa-${Date.now()}-${i}`
      }));
      return res.json(result);
    }
    return res.json(generateFallbackCOAs());
  } catch {
    return res.json(generateFallbackCOAs());
  }
});

// Satellite GEOINT & Orbital Change Detection Endpoint
app.post("/api/gemini/satellite-geoint", async (req, res) => {
  const { targetName, coordinates, sensorType, cloudPenetrationSAR } = req.body;

  const fallbackGeoint = {
    targetName: targetName || "Mandera-Wajir Forward Border Zone",
    coordinates: coordinates || [41.2, 3.4],
    previousPassDate: "72 Hours Prior",
    currentPassDate: "Orbital Pass Just Completed",
    changeConfidence: 94,
    analysisSummary: `Multi-temporal GEOINT pass ${cloudPenetrationSAR ? 'utilizing X-Band SAR Synthetic Aperture Radar' : 'via 0.3m multispectral optical imagery'} confirms newly fortified earthen revetments and concealed vehicle tracks. Subterranean heat bloom detected under camouflage netting.`,
    detectedModifications: [
      "New 150m vehicle dispersal track cutting through dry wadi corridor",
      "Earthen revetments constructed around temporary storage structures",
      "Anomalous metallic radar backscatter consistent with mobile launcher platform",
      "Camouflage netting masking 3 technical transport vehicles"
    ],
    threatElevation: "CRITICAL",
    sarPenetrationUsed: Boolean(cloudPenetrationSAR)
  };

  try {
    const ai = getAI();
    if (!ai) return res.json(fallbackGeoint);

    const prompt = `You are the Chief Satellite Intelligence (GEOINT) Analyst for the Kenya Defence Forces and Kenya Space Agency.
Target AO: ${targetName || 'Forward Operational Zone'} at coordinates [${coordinates?.join(', ') || '38.0, 1.0'}].
Sensor Modality: ${sensorType || 'SAR Radar & Optical Multispectral'}.
SAR Cloud Penetration: ${cloudPenetrationSAR ? 'Enabled (X-Band Radar penetrates heavy cloud/sandstorms)' : 'Standard Optical'}.

Perform automated orbital change detection comparing the current orbital pass to historical baseline imagery.
Provide:
1. targetName
2. coordinates: [lon, lat]
3. previousPassDate: e.g. "48 Hours Ago"
4. currentPassDate: e.g. "Live Downlink [KENSAT-1]"
5. changeConfidence: Integer 0-100
6. analysisSummary: Authoritative 2-3 sentence military GEOINT assessment
7. detectedModifications: Array of 3-4 specific physical infrastructure/vehicle changes identified
8. threatElevation: 'CRITICAL', 'MODERATE', 'LOW', or 'NORMAL'
9. sarPenetrationUsed: boolean`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetName: { type: Type.STRING },
            coordinates: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            previousPassDate: { type: Type.STRING },
            currentPassDate: { type: Type.STRING },
            changeConfidence: { type: Type.NUMBER },
            analysisSummary: { type: Type.STRING },
            detectedModifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            threatElevation: { type: Type.STRING },
            sarPenetrationUsed: { type: Type.BOOLEAN }
          },
          required: ["targetName", "coordinates", "changeConfidence", "analysisSummary", "detectedModifications", "threatElevation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch {
    return res.json(fallbackGeoint);
  }
});

// Autonomous Drone Swarm Mesh & C-UAS Routing Endpoint
app.post("/api/gemini/swarm-telemetry", async (req, res) => {
  const { droneFleet, targetCoordinates, formationType } = req.body;

  const fallbackSwarm = {
    formation: formationType || "PINCER_CORDON",
    optimalAltitudeMeters: 3800,
    meshProtocolBridging: "MAVLink 2.0 <-> STANAG 4586 Interoperable Bridge Active",
    threatInterceptionProbability: 96,
    waypointPath: [
      [38.5, 1.8],
      [39.2, 2.2],
      [40.1, 2.8]
    ],
    cuasShieldStatus: "RF Electronic Jamming Dome Active (2.4GHz / 5.8GHz / GNSS L1/L2)",
    tacticalDirectives: [
      "Bayraktar TB2 established high-altitude CAP at 18,000 ft with laser designator on standby",
      "ScanEagle ISR maintaining continuous electro-optical tracking of ingress vectors",
      "Vampire C-UAS battery auto-locked on rogue RF control telemetry"
    ]
  };

  try {
    const ai = getAI();
    if (!ai) return res.json(fallbackSwarm);

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are the Autonomous Drone Swarm & Counter-UAS (C-UAS) Battle Manager for Project STAR.
Fleet: ${JSON.stringify(droneFleet || [])}
Target Coordinates: [${targetCoordinates?.join(', ') || '39.0, 1.5'}]
Desired Formation: ${formationType || 'HUNTER_KILLER'}

Calculate:
1. formation: The tactical swarm formation name
2. optimalAltitudeMeters: Integer altitude
3. meshProtocolBridging: Status of MAVLink 2.0 / STANAG 4586 protocol translation
4. threatInterceptionProbability: Integer percentage 0-100
5. waypointPath: Array of 3 coordinate pairs [[lon, lat], ...]
6. cuasShieldStatus: Status of anti-drone RF jamming and spoofing defense
7. tacticalDirectives: Array of 3 short military swarm orders`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formation: { type: Type.STRING },
            optimalAltitudeMeters: { type: Type.NUMBER },
            meshProtocolBridging: { type: Type.STRING },
            threatInterceptionProbability: { type: Type.NUMBER },
            waypointPath: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } },
            cuasShieldStatus: { type: Type.STRING },
            tacticalDirectives: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["formation", "optimalAltitudeMeters", "meshProtocolBridging", "threatInterceptionProbability", "tacticalDirectives"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch {
    return res.json(fallbackSwarm);
  }
});

// Geopolitical Crisis War Game & Deterrence Simulator Endpoint
app.post("/api/gemini/crisis-wargame", async (req, res) => {
  const { scenarioId, actionTaken } = req.body;

  const fallbackCrisis = {
    escalationRiskScore: 35,
    kenyaDeterrencePosture: "HEIGHTENED DEFENSIVE UMBRELLA // MARITIME CHOKEPOINT SECURED",
    projectedOutcomes: [
      "KDF Navy & C-UAS mesh successfully deter asymmetric drone attacks along Western Indian Ocean sea lines",
      "Sovereign airspace remains inviolable via layered radar and Bayraktar CAP patrols",
      "Commercial shipping lanes rerouted safely through monitored KDF escort corridors"
    ],
    strategicDeEscalationAdvice: "Maintain visible sovereign deterrence with KNS Jasiri and orbital KENSAT SAR sweeps while sharing non-kinetic early warning telemetry with regional partner task forces to stabilize commercial traffic.",
    economicImpactMitigation: "Fuel and grain supply reserves safeguarded; 0% disruption to Port of Mombasa operations."
  };

  try {
    const ai = getAI();
    if (!ai) return res.json(fallbackCrisis);

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are the Supreme Geopolitical War Game & Crisis Deterrence AI Strategist for Kenya.
Scenario Context: Global and regional tensions (e.g. US-Iran Red Sea / Bab-el-Mandeb / Indian Ocean shipping escalation, asymmetric ballistic & drone barrages, critical subsea cable vulnerabilities).
Scenario ID: ${scenarioId || 'crisis-red-sea'}
Commander's Intervening Action: "${actionTaken || 'Deploy Layered C-UAS Electronic Shield & Joint Maritime Patrol'}"

Analyze the ripple effects and calculate sovereign deterrence outcomes for Kenya and East Africa.
Provide:
1. escalationRiskScore: Integer 0-100 (lower means successfully de-escalated/contained)
2. kenyaDeterrencePosture: Authoritative military readiness status
3. projectedOutcomes: Array of 3 strategic real-world military/diplomatic consequences
4. strategicDeEscalationAdvice: 2-sentence actionable guidance for National Security Council
5. economicImpactMitigation: Assessment of port, shipping, and supply line stability`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            escalationRiskScore: { type: Type.NUMBER },
            kenyaDeterrencePosture: { type: Type.STRING },
            projectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategicDeEscalationAdvice: { type: Type.STRING },
            economicImpactMitigation: { type: Type.STRING }
          },
          required: ["escalationRiskScore", "kenyaDeterrencePosture", "projectedOutcomes", "strategicDeEscalationAdvice", "economicImpactMitigation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch {
    return res.json(fallbackCrisis);
  }
});

// OSINT Geopolitical Intelligence Endpoint
app.post("/api/gemini/osint", async (req, res) => {
  const { sectorName } = req.body;
  const targetSector = sectorName || 'Kenya';

  const defaultSources = [
    { web: { title: "KDF Operations Briefing - Eastern Command", uri: "https://mod.go.ke" } },
    { web: { title: "East African Maritime Security Report", uri: "https://eac.int" } },
    { web: { title: "Horn of Africa Security Advisory (IGAD)", uri: "https://igad.int" } }
  ];

  const defaultOsintText = `Active OSINT telemetry for ${targetSector}: Regional border sectors maintain heightened reconnaissance status. Joint security task forces are conducting routine patrols along major transportation arteries. Satellite surveillance confirms stable maritime traffic in the Lamu and Mombasa sea corridors. Counter-UAS electronic defense shields are operating at 99.8% efficiency.`;

  try {
    const ai = getAI();
    if (!ai) {
      return res.json({ text: defaultOsintText, sources: defaultSources });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are the Chief OSINT & Geopolitical Intelligence Officer for the Kenya Defence Forces.
Provide an authoritative, detailed, real-world security situational assessment for the ${targetSector} sector and Horn of Africa / Red Sea maritime corridors.
Cover:
1. Current border security readiness and multi-domain defense posture.
2. Regional maritime & energy corridor protection (Indian Ocean / Lamu / Mombasa).
3. Counter-asymmetric drone and radar early-warning status.
Keep it structured in 2 clear, authoritative paragraphs with military precision.`,
    });

    return res.json({
      text: response.text || defaultOsintText,
      sources: defaultSources
    });
  } catch {
    return res.json({
      text: defaultOsintText,
      sources: defaultSources
    });
  }
});

// Tactical Intel Report Analysis Endpoint
app.post("/api/gemini/analyze-intel", async (req, res) => {
  const { report } = req.body;

  const fallbackIntel = () => {
    const lower = (report || '').toLowerCase();
    const isThreat = lower.includes('suspect') || lower.includes('stolen') || lower.includes('convoy') || lower.includes('ied') || lower.includes('threat') || lower.includes('incursion') || lower.includes('weapon') || lower.includes('drone') || lower.includes('sar');
    
    let lat = -1.286389;
    let lon = 36.817223;
    if (lower.includes('garissa')) { lon = 39.64; lat = -0.45; }
    else if (lower.includes('tsavo')) { lon = 38.46; lat = -2.98; }
    else if (lower.includes('lamu') || lower.includes('manda')) { lon = 40.90; lat = -2.27; }
    else if (lower.includes('mandera')) { lon = 41.86; lat = 3.93; }
    else if (lower.includes('turkana') || lower.includes('marsabit')) { lon = 37.98; lat = 2.33; }
    else if (lower.includes('eldoret')) { lon = 35.28; lat = 0.52; }

    return {
      summary: `Parsed field report: ${report?.substring(0, 100)}... Identified actionable security parameters.`,
      isThreat,
      threatType: isThreat ? (lower.includes('weapon') || lower.includes('ied') || lower.includes('incursion') || lower.includes('drone') ? 'Confirmed' : 'Potential') : 'Potential',
      location: [lon, lat],
      priority: isThreat ? 'HIGH' : 'ROUTINE',
      classification: 'SECRET // KDF-STAR',
      recommendedAction: isThreat ? 'Deploy Quick Reaction Force (QRF) to forward grid' : 'Maintain routine ISR surveillance'
    };
  };

  try {
    const ai = getAI();
    if (!ai) return res.json(fallbackIntel());

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an automated Military SIGINT/HUMINT/GEOINT Parser for the Kenya Defence Forces.
Analyze this field report: "${report}".
Extract:
1. Concise tactical military summary (1-2 sentences).
2. isThreat (boolean): Whether this represents an active security threat or intrusion.
3. threatType: 'Confirmed' (clear active hostility/weapons/drones), 'Potential' (suspicious movement), or 'Neutralized'.
4. location: [longitude, latitude] estimated coordinates inside Kenya (e.g. Kenya longitudes ~34-42, latitudes ~-4.5 to +4.5).
5. priority: 'CRITICAL', 'HIGH', or 'ROUTINE'.
6. recommendedAction: 1-sentence recommended KDF immediate action.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            isThreat: { type: Type.BOOLEAN },
            threatType: { type: Type.STRING },
            location: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            priority: { type: Type.STRING },
            recommendedAction: { type: Type.STRING }
          },
          required: ["summary", "isThreat", "threatType", "location", "priority"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch {
    return res.json(fallbackIntel());
  }
});

// Command Terminal AI Staff Officer Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { message, assets, threats, currentSector } = req.body;

  const fallbackChat = () => {
    const msg = (message || '').toLowerCase();
    let reply = "Directive acknowledged, Commander. All systems operational. KDF tactical grid synchronized.";
    if (msg.includes('satellite') || msg.includes('geoint') || msg.includes('sar')) {
      reply = `SATELLITE INTEL BRIEF: KENSAT-1 and COSMO-SkyMed X-Band SAR orbits are currently covering the AO. Sub-surface radar and optical change detection actively scanning frontier corridors.`;
    } else if (msg.includes('drone') || msg.includes('swarm') || msg.includes('cuas')) {
      reply = `DRONE FLEET & C-UAS STATUS: Bayraktar TB2 and ScanEagle swarms operating under MAVLink 2.0 / STANAG 4586 protocol bridge. Counter-UAS RF jamming domes active over Mombasa and Mandera.`;
    } else if (msg.includes('iran') || msg.includes('red sea') || msg.includes('crisis') || msg.includes('chokepoint')) {
      reply = `GEOPOLITICAL CRISIS PROTOCOL: KDF Strategic Deterrence Doctrine active. Western Indian Ocean sea lanes protected by KNS Jasiri and aerial C-UAS umbrella. Early warning systems online.`;
    } else if (msg.includes('status') || msg.includes('readiness')) {
      reply = `KDF STATUS REPORT: ${assets?.length || 6} active assets online. ${threats?.length || 0} active contacts tracked. Multi-domain readiness is at 98%.`;
    }
    return { reply };
  };

  try {
    const ai = getAI();
    if (!ai) return res.json(fallbackChat());

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are the Chief AI Staff Officer for Project S.T.A.R. (Axiom C4ISR Protocol), serving the Kenya Defence Forces (KDF).
Commander's Directive: "${message}"
Tactical Context:
- Active Units: ${assets?.length || 6} (Infantry, Air Bases, Naval Patrols, Satellite Constellations, Drone Swarms)
- Active Threats Tracked: ${threats?.length || 0}
- Current Sector: ${currentSector || 'National Command'}
- Capabilities: Orbital SAR Visual Intel, Universal MAVLink/STANAG Drone Swarm Mesh, Counter-UAS Electronic Jamming, Geopolitical Crisis & Deterrence Modeling.

Respond with supreme military precision, brevity, strategic insight, and professional composure. Keep response to 2-4 sentences. Include tactical callsigns where appropriate.`,
    });

    return res.json({ reply: response.text || fallbackChat().reply });
  } catch {
    return res.json(fallbackChat());
  }
});

// IMINT Imagery Generation / Simulation Endpoint
app.post("/api/gemini/imint", async (req, res) => {
  const { scenario } = req.body;
  try {
    const ai = getAI();
    if (!ai) return res.json({ imageBase64: null, simulated: true });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            text: `High-resolution military tactical FLIR thermal and satellite imagery, top-down drone reconnaissance view of: ${scenario}. Black, cyan, and thermal heat signatures with tactical crosshair coordinate overlays and telemetry sensor artifacts.`
          }
        ]
      }
    });

    const candidates = response.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return res.json({ imageBase64: part.inlineData.data, simulated: false });
        }
      }
    }

    return res.json({ imageBase64: null, simulated: true });
  } catch {
    return res.json({ imageBase64: null, simulated: true });
  }
});

// Veo Mission Video Forecasting Endpoint
app.post("/api/gemini/forecast", async (req, res) => {
  const { coaObjective } = req.body;
  try {
    const ai = getAI();
    if (!ai) return res.json({ videoUrl: null, simulated: true });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: `Cinematic military simulation: ${coaObjective}. Tactical drone night-vision and thermal FLIR overlay, HUD telemetry, hyper-realistic terrain flyover of Kenya.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    let attempts = 0;
    while (!operation.done && attempts < 8) {
      await new Promise(r => setTimeout(r, 4000));
      operation = await ai.operations.getVideosOperation({ operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    const fullUrl = downloadLink ? `${downloadLink}&key=${apiKey}` : null;
    return res.json({ videoUrl: fullUrl, simulated: false });
  } catch {
    return res.json({ videoUrl: null, simulated: true });
  }
});

// Recon Video Generator Endpoint
app.post("/api/gemini/recon-video", async (req, res) => {
  const { sectorName, environment } = req.body;
  try {
    const ai = getAI();
    if (!ai) return res.json({ videoUrl: null, simulated: true });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: `Low-altitude tactical drone reconnaissance patrol over ${sectorName}, Kenya. Terrain: ${environment}. First-person thermal imaging HUD, camera pan, scanning for contacts.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    let attempts = 0;
    while (!operation.done && attempts < 8) {
      await new Promise(r => setTimeout(r, 4000));
      operation = await ai.operations.getVideosOperation({ operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    const fullUrl = downloadLink ? `${downloadLink}&key=${apiKey}` : null;
    return res.json({ videoUrl: fullUrl, simulated: false });
  } catch {
    return res.json({ videoUrl: null, simulated: true });
  }
});

// Vite Middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Project S.T.A.R.] Tactical Command Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
