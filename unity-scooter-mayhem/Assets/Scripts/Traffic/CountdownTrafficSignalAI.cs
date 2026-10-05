using System;
using UnityEngine;
using TMPro;

namespace ScooterMayhem.Traffic
{
    public enum TrafficSignalState
    {
        Red,
        Yellow,
        Green
    }

    /// <summary>
    /// CountdownTrafficSignalAI (99秒超長倒數紅綠燈與起步偷跑彈射系統)
    /// Replicates the authentic Taiwanese intersection experience:
    /// - Ultra-long digital countdown timers on intersection gantries.
    /// - Last 3s "偷跑起步彈射" jump-start combo when launching right before green.
    /// - Speed enforcement & camera flash if blowing through red light with > 5s remaining.
    /// </summary>
    public class CountdownTrafficSignalAI : MonoBehaviour
    {
        [Header("Signal State & Timing")]
        [SerializeField] private TrafficSignalState currentState = TrafficSignalState.Red;
        [SerializeField] private float redDuration = 35.0f;
        [SerializeField] private float greenDuration = 22.0f;
        [SerializeField] private float yellowDuration = 3.5f;
        [SerializeField] private float currentTimer = 35.0f;

        [Header("Intersection Stop Zone")]
        [SerializeField] private float intersectionZ = 0f;
        [SerializeField] private float stopZoneWidth = 10.0f;
        [SerializeField] private float stopZoneDepth = 5.5f;

        [Header("Visual Elements")]
        [SerializeField] private MeshRenderer redLamp;
        [SerializeField] private MeshRenderer yellowLamp;
        [SerializeField] private MeshRenderer greenLamp;
        [SerializeField] private TextMeshPro countdownText;
        [SerializeField] private TextMeshPro streetSignText;

        [Header("Audio & FX")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip cameraShutterClip;
        [SerializeField] private AudioClip whistleClip;

        // Flags
        private bool jumpStartAwarded = false;
        private bool redLightFined = false;

        public TrafficSignalState CurrentState => currentState;
        public float RemainingSeconds => currentTimer;

        public event Action<string, int> OnJumpStartBonus;
        public event Action<string, int, int> OnRedLightViolation; // (reason, fineAmount, wantedHeat)

        private void Start()
        {
            currentTimer = redDuration;
            currentState = TrafficSignalState.Red;
            UpdateVisuals();
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            currentTimer -= dt;

            if (currentTimer <= 0f)
            {
                CycleNextState();
            }

            UpdateVisuals();
        }

        private void CycleNextState()
        {
            switch (currentState)
            {
                case TrafficSignalState.Red:
                    currentState = TrafficSignalState.Green;
                    currentTimer = greenDuration;
                    jumpStartAwarded = false;
                    redLightFined = false;
                    break;
                case TrafficSignalState.Green:
                    currentState = TrafficSignalState.Yellow;
                    currentTimer = yellowDuration;
                    break;
                case TrafficSignalState.Yellow:
                    currentState = TrafficSignalState.Red;
                    currentTimer = redDuration;
                    jumpStartAwarded = false;
                    redLightFined = false;
                    break;
            }
        }

        private void UpdateVisuals()
        {
            int displaySec = Mathf.Max(1, Mathf.FloorToInt(currentTimer));

            if (countdownText != null)
            {
                countdownText.text = displaySec.ToString("D2");
                if (currentState == TrafficSignalState.Red)
                {
                    countdownText.color = currentTimer <= 3.0f ? Color.yellow : Color.red;
                }
                else if (currentState == TrafficSignalState.Yellow)
                {
                    countdownText.color = Color.yellow;
                }
                else
                {
                    countdownText.color = Color.green;
                }
            }

            // Emissive materials update
            if (redLamp != null)
            {
                redLamp.material.SetColor("_EmissionColor", currentState == TrafficSignalState.Red ? Color.red * 2.5f : Color.black);
            }
            if (yellowLamp != null)
            {
                yellowLamp.material.SetColor("_EmissionColor", currentState == TrafficSignalState.Yellow ? Color.yellow * 2.5f : Color.black);
            }
            if (greenLamp != null)
            {
                greenLamp.material.SetColor("_EmissionColor", currentState == TrafficSignalState.Green ? Color.green * 2.5f : Color.black);
            }
        }

        /// <summary>
        /// Check player entering intersection stopline
        /// </summary>
        public void CheckPlayerIntersection(Vector3 playerPos, float speedKmH, float throttleInput, bool isCrashed)
        {
            if (isCrashed) return;

            bool inStopZone = Mathf.Abs(playerPos.z - intersectionZ) < stopZoneDepth && Mathf.Abs(playerPos.x) < (stopZoneWidth * 0.5f);
            if (!inStopZone) return;

            // 1. Jump Start Launch during final 3s of Red Light
            if (currentState == TrafficSignalState.Red && currentTimer <= 3.0f && currentTimer > 0.2f)
            {
                if (!jumpStartAwarded && speedKmH > 14f && throttleInput > 0.1f)
                {
                    jumpStartAwarded = true;
                    OnJumpStartBonus?.Invoke("【紅綠燈起步偷跑彈射！】起步神速！", 600);
                }
            }
            // 2. Running Red Light when > 5s remaining
            else if (currentState == TrafficSignalState.Red && currentTimer > 5.0f && !redLightFined)
            {
                if (speedKmH > 24f)
                {
                    redLightFined = true;
                    if (audioSource != null && whistleClip != null) audioSource.PlayOneShot(whistleClip);
                    if (audioSource != null && cameraShutterClip != null) audioSource.PlayOneShot(cameraShutterClip);

                    OnRedLightViolation?.Invoke("【科技執法：闖紅燈重大違規！】", 1800, 2);
                }
            }
        }

        public void SetStreetName(string name)
        {
            if (streetSignText != null)
            {
                streetSignText.text = name;
            }
        }
    }
}
